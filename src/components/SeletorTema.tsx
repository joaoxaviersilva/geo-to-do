// Botão do tema no mapa: abre um painel com Automático / Claro / Escuro
// e mostra qual fonte está decidindo o tema (Sensor de luz, Brilho da tela, Sistema ou Manual).
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ALVO_TOQUE, espaco, fonte as tipografia, raios, useTema } from '../theme';
import { setModo, type Modo } from '../lib/temaStore';
import BotaoRedondo from './BotaoRedondo';
import Vidro from './Vidro';

const OPCOES: { modo: Modo; rotulo: string; icone: keyof typeof Ionicons.glyphMap }[] = [
  { modo: 'auto', rotulo: 'Automático', icone: 'contrast-outline' },
  { modo: 'claro', rotulo: 'Claro', icone: 'sunny-outline' },
  { modo: 'escuro', rotulo: 'Escuro', icone: 'moon-outline' },
];

const ICONE_BOTAO = { auto: 'contrast', claro: 'sunny', escuro: 'moon' } as const;

export default function SeletorTema() {
  const { cores, modo, fonte, leitura } = useTema();
  const [aberto, setAberto] = useState(false);
  const textoFonte = leitura ? `${fonte} · ${leitura}` : fonte;

  function escolher(m: Modo) {
    setModo(m);
    setAberto(false);
  }

  return (
    // Botão em cima, chip embaixo (em fluxo); só o painel fica solto (absolute)
    <View style={styles.raiz}>
      <BotaoRedondo
        flutuante
        icone={ICONE_BOTAO[modo]}
        rotulo={`Tema: ${modo}. Toque para mudar`}
        onPress={() => setAberto(!aberto)}
      />

      {aberto ? (
        <Vidro style={styles.painel}>
          {OPCOES.map((o) => (
            <Pressable
              key={o.modo}
              onPress={() => escolher(o.modo)}
              accessibilityRole="button"
              accessibilityLabel={`Tema ${o.rotulo}`}
              accessibilityState={{ selected: modo === o.modo }}
              style={({ pressed }) => [styles.opcao, pressed && { opacity: 0.6 }]}
            >
              <Ionicons name={o.icone} size={20} color={cores.texto} />
              <Text style={[tipografia.corpo, { color: cores.texto, flex: 1 }]}>{o.rotulo}</Text>
              {modo === o.modo && <Ionicons name="checkmark" size={20} color={cores.destaque} />}
            </Pressable>
          ))}
          <Text style={[tipografia.legenda, { color: cores.texto, opacity: 0.8 }]}>Fonte: {textoFonte}</Text>
        </Vidro>
      ) : (
        // Chip sempre visível no Automático, para mostrar a fonte em uso
        modo === 'auto' && (
          <Vidro style={styles.chip} pointerEvents="none">
            <Text style={[tipografia.legenda, { color: cores.texto }]} numberOfLines={1}>
              {fonte}
            </Text>
          </Vidro>
        )
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  // Coluna alinhada à direita: botão 48x48 em cima e o chip embaixo (largura do próprio texto)
  raiz: { alignItems: 'flex-end' },
  painel: {
    position: 'absolute',
    top: 48 + espaco.sm,
    right: 0,
    width: 230,
    borderRadius: raios.md,
    padding: espaco.sm,
    gap: espaco.xs,
  },
  opcao: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espaco.md,
    minHeight: ALVO_TOQUE,
    paddingHorizontal: espaco.sm,
  },
  chip: {
    // Fluxo normal (sem absolute/largura fixa): cresce conforme o texto e não é cortado
    alignSelf: 'flex-end',
    marginTop: espaco.xs,
    borderRadius: raios.pill,
    paddingVertical: espaco.xs,
    paddingHorizontal: espaco.md,
  },
});
