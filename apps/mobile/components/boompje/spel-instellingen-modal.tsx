import { Ionicons } from '@expo/vector-icons';
import { Modal, Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import type { BoompjeSettings, NumPlayers, Op16eActie } from '@deckscores/shared';
import { KlaverjasButton } from '@/components/ui/klaverjas-button';
import { Palette, Radius, Spacing, Typography } from '@/constants/theme';

type Props = {
  visible: boolean;
  settings: BoompjeSettings;
  onChange: (settings: BoompjeSettings) => void;
  onClose: () => void;
};

const NUM_PLAYER_OPTIONS: { value: NumPlayers; label: string }[] = [
  { value: 4, label: '4 spelers' },
  { value: 3, label: '3 spelers (ieder voor zich)' },
  { value: 2, label: '2 spelers (1-vs-1)' },
];

export function SpelInstellingenModal({ visible, settings, onChange, onClose }: Props) {
  const setAfronden = (afronden: boolean) => onChange({ ...settings, afronden });
  const setDelerAangeven = (deler_aangeven: boolean) =>
    onChange({ ...settings, deler_aangeven });
  const setOp16e = (op_16e_actie: Op16eActie) => onChange({ ...settings, op_16e_actie });
  const setNumPlayers = (num_players: NumPlayers) =>
    onChange({ ...settings, num_players });

  return (
    <Modal animationType="slide" visible={visible} transparent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <View style={styles.header}>
            <Text style={styles.title}>Spel instellingen</Text>
            <Pressable onPress={onClose} hitSlop={12}>
              <Ionicons name="close" size={24} color={Palette.greyDark} />
            </Pressable>
          </View>

          <Row label="Afronden">
            <Switch
              value={settings.afronden}
              onValueChange={setAfronden}
              trackColor={{ true: Palette.greenSoft, false: Palette.greyLight }}
              thumbColor={settings.afronden ? Palette.greenAction : Palette.white}
            />
          </Row>

          <Row label="Deler aangeven">
            <Switch
              value={settings.deler_aangeven}
              onValueChange={setDelerAangeven}
              trackColor={{ true: Palette.greenSoft, false: Palette.greyLight }}
              thumbColor={settings.deler_aangeven ? Palette.greenAction : Palette.redAction}
            />
          </Row>

          <View style={styles.makenDraaienBlock}>
            <Text style={styles.helper}>Bij 16 Giffies:</Text>
            <View style={styles.makenDraaienRow}>
              <KlaverjasButton
                label="Maken"
                variant={settings.op_16e_actie === 'maken' ? 'success' : 'outline'}
                onPress={() => setOp16e('maken')}
              />
              <Text style={styles.helper}>Of</Text>
              <KlaverjasButton
                label="Draaien"
                variant={settings.op_16e_actie === 'draaien' ? 'danger' : 'outline'}
                onPress={() => setOp16e('draaien')}
              />
            </View>
          </View>

          <View style={styles.spelersBlock}>
            <Text style={styles.helper}>Aantal spelers:</Text>
            {NUM_PLAYER_OPTIONS.map((option) => (
              <SpelersOption
                key={option.value}
                label={option.label}
                selected={settings.num_players === option.value}
                onPress={() => setNumPlayers(option.value)}
              />
            ))}
            <Text style={styles.note}>
              Wisselen reset de geselecteerde spelers en deler.
            </Text>
          </View>

          <KlaverjasButton label="Klaar" variant="primary" fullWidth onPress={onClose} />
        </View>
      </View>
    </Modal>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      {children}
    </View>
  );
}

function SpelersOption({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.spelersRow, pressed && styles.spelersRowPressed]}
    >
      <View style={[styles.radio, selected && styles.radioSelected]}>
        {selected ? <View style={styles.radioInner} /> : null}
      </View>
      <Text style={styles.spelersLabel}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: Palette.white,
    borderTopLeftRadius: Radius.lg,
    borderTopRightRadius: Radius.lg,
    padding: Spacing.lg,
    gap: Spacing.lg,
  },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { ...Typography.heading, color: Palette.blueDark },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm,
  },
  rowLabel: { ...Typography.bodyBold, color: Palette.black },
  helper: { color: Palette.greyDark },
  note: { color: Palette.greyMid, fontSize: 12, fontStyle: 'italic' },
  makenDraaienBlock: { gap: Spacing.sm },
  makenDraaienRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.lg,
  },
  spelersBlock: { gap: Spacing.sm, paddingTop: Spacing.md },
  spelersRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing.xs,
  },
  spelersRowPressed: { opacity: 0.7 },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: Palette.greyDark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: { borderColor: Palette.greenAction },
  radioInner: { width: 12, height: 12, borderRadius: 6, backgroundColor: Palette.greenAction },
  spelersLabel: { ...Typography.body, color: Palette.black },
});
