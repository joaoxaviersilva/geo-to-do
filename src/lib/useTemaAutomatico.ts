// Liga o tema automático. Chamado uma vez no _layout.
// Fonte da luz ambiente, em ordem:
//  1) LightSensor (Android)
//  2) Brilho da tela (iOS com "Brilho automático" ligado: o iOS ajusta o brilho pela luz do ambiente)
//  3) Tema do sistema (se nada acima estiver disponível)
import { useEffect, useState } from 'react';
import { LightSensor } from 'expo-sensors';
import * as Brightness from 'expo-brightness';
import { atualizarTema, carregarModo, getTema, ouvirTema, type Modo } from './temaStore';

// Limiares com histerese: escurece abaixo do menor, clareia acima do maior,
// e na faixa do meio mantém o tema atual (evita ficar piscando).
const LUX = { escuro: 50, claro: 150 };
const BRILHO = { escuro: 0.3, claro: 0.5 }; // calibrar no aparelho
const INTERVALO_BRILHO = 2000; // ms entre leituras do brilho
const AMOSTRAS = 3; // média das últimas leituras (suaviza picos)

// Decide se o tema deve ser escuro, com histerese
export function decidirEscuro(valor: number, atualEscuro: boolean, limiteEscuro: number, limiteClaro: number) {
  if (valor < limiteEscuro) return true;
  if (valor > limiteClaro) return false;
  return atualEscuro; // faixa do meio: não muda
}

// Guarda as últimas leituras e devolve a média
function criarMedia() {
  const lista: number[] = [];
  return (v: number) => {
    lista.push(v);
    if (lista.length > AMOSTRAS) lista.shift();
    return lista.reduce((a, b) => a + b, 0) / lista.length;
  };
}

export function useTemaAutomatico() {
  const [modo, setModoLocal] = useState<Modo>(getTema().modo);

  // Carrega o modo salvo e acompanha mudanças de modo
  useEffect(() => {
    carregarModo();
    return ouvirTema((e) => setModoLocal(e.modo));
  }, []);

  // Só roda a leitura de luz no modo Automático
  useEffect(() => {
    if (modo !== 'auto') return;

    let ativo = true;
    let parar: (() => void) | null = null;

    (async () => {
      const media = criarMedia();

      // 1) LightSensor (só existe no Android)
      try {
        if (await LightSensor.isAvailableAsync()) {
          LightSensor.setUpdateInterval(1000);
          const sub = LightSensor.addListener(({ illuminance }) => {
            const lux = media(illuminance);
            const atual = getTema().escuroAuto ?? false;
            atualizarTema({
              escuroAuto: decidirEscuro(lux, atual, LUX.escuro, LUX.claro),
              fonte: 'Sensor de luz',
              leitura: `${Math.round(lux)} lux`,
            });
          });
          parar = () => sub.remove();
          if (!ativo) parar(); // saiu do automático enquanto preparava
          return;
        }
      } catch {
        // sensor indisponível: tenta a próxima fonte
      }

      // 2) Brilho da tela (aproximação no iOS)
      try {
        await Brightness.getBrightnessAsync(); // testa se funciona
        const ler = async () => {
          const b = media(await Brightness.getBrightnessAsync());
          if (!ativo) return;
          const atual = getTema().escuroAuto ?? false;
          atualizarTema({
            escuroAuto: decidirEscuro(b, atual, BRILHO.escuro, BRILHO.claro),
            fonte: 'Brilho da tela',
            leitura: `${Math.round(b * 100)}% de brilho`,
          });
        };
        await ler();
        if (!ativo) return; // saiu do automático enquanto preparava
        const id = setInterval(ler, INTERVALO_BRILHO);
        parar = () => clearInterval(id);
        return;
      } catch {
        // sem brilho: cai no sistema
      }

      // 3) Sistema: escuroAuto null faz o useTema seguir o tema do sistema
      if (ativo) atualizarTema({ escuroAuto: null, fonte: 'Sistema', leitura: '' });
    })();

    return () => {
      ativo = false;
      parar?.();
    };
  }, [modo]);
}
