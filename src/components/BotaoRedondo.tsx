// Botão redondo com ícone (alvo de toque mínimo 44x44), usado nos botões flutuantes e no raio.
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ALVO_TOQUE, fonte, sombra, useTema } from '../theme';
import Vidro from './Vidro';

type Props = {
  icone: keyof typeof Ionicons.glyphMap;
  rotulo: string; // descrição para acessibilidade
  onPress: () => void;
  ativo?: boolean; // destaca o botão (ex.: modo teste ligado)
  corAtiva?: string; // cor de fundo quando ativo (padrão: destaque)
  selo?: number; // número exibido num círculo no canto
  flutuante?: boolean; // com sombra, para ficar sobre o mapa
  tamanho?: number;
};

export default function BotaoRedondo({
  icone,
  rotulo,
  onPress,
  ativo = false,
  corAtiva,
  selo,
  flutuante = false,
  tamanho = 48,
}: Props) {
  const { cores } = useTema();
  const lado = Math.max(tamanho, ALVO_TOQUE);
  const corIcone = ativo ? cores.sobreDestaque : cores.texto;
  // Botão flutuante normal usa vidro; quando ativo, fica colorido e sólido (mais legível)
  const usaVidro = flutuante && !ativo;
  const fundo = ativo ? (corAtiva ?? cores.destaque) : usaVidro ? 'transparent' : cores.card;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={rotulo}
      hitSlop={8} // aumenta a área de toque além do desenho
      style={({ pressed }) => [
        styles.base,
        { width: lado, height: lado, borderRadius: lado / 2, backgroundColor: fundo },
        // Sem vidro (ou não flutuante): borda e sombra como antes
        !usaVidro && { borderColor: cores.borda },
        flutuante && !usaVidro && sombra(cores),
        pressed && { opacity: 0.7 },
      ]}
    >
      {/* Camada de vidro (ou card de reserva) atrás do ícone; o toque fica com o Pressable */}
      {usaVidro && <Vidro pointerEvents="none" style={[StyleSheet.absoluteFill, { borderRadius: lado / 2 }]} />}
      <Ionicons name={icone} size={24} color={corIcone} />
      {selo !== undefined && selo > 0 && (
        <View style={[styles.selo, { backgroundColor: cores.destaque, borderColor: cores.card }]}>
          <Text style={[fonte.legenda, { color: cores.sobreDestaque, fontSize: 11 }]}>{selo}</Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: { alignItems: 'center', justifyContent: 'center', borderWidth: StyleSheet.hairlineWidth },
  selo: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    paddingHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
