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

          <Section title="Score weergave">
            <Row
              label="Afronden"
              hint="Toon scores op een schaal van 0 - 10 i.p.v. 0 - 162"
            >
              <Switch
                value={settings.afronden}
                onValueChange={setAfronden}
                trackColor={{ true: Palette.blueLight, false: Palette.greyLight }}
                thumbColor={settings.afronden ? Palette.blueDark : Palette.white}
              />
            </Row>
          </Section>

          <Section title="Deler">
            <Row
              label="Deler kiezen per giffie"
              hint="Anders rouleert hij automatisch met de klok mee"
            >
              <Switch
                value={settings.deler_aangeven}
                onValueChange={setDelerAangeven}
                trackColor={{ true: Palette.blueLight, false: Palette.greyLight }}
                thumbColor={settings.deler_aangeven ? Palette.blueDark : Palette.white}
              />
            </Row>
          </Section>

          <Section title="Bij 16 giffies">
            <View style={styles.makenDraaienRow}>
              <KlaverjasButton
                label="Maken"
                variant={settings.op_16e_actie === 'maken' ? 'primary' : 'outline'}
                onPress={() => setOp16e('maken')}
              />
              <Text style={styles.helper}>of</Text>
              <KlaverjasButton
                label="Draaien"
                variant={settings.op_16e_actie === 'draaien' ? 'primary' : 'outline'}
                onPress={() => setOp16e('draaien')}
              />
            </View>
          </Section>

          <Section title="Aantal spelers">
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
          </Section>

          <KlaverjasButton label="Klaar" variant="success" fullWidth onPress={onClose} />
        </View>
      </View>
    </Modal>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

function Row({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.row}>
      <View style={styles.rowText}>
        <Text style={styles.rowLabel}>{label}</Text>
        {hint ? <Text style={styles.rowHint}>{hint}</Text> : null}
      </View>
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
    maxHeight: '90%',
  },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { ...Typography.heading, color: Palette.blueDark },
  section: { gap: Spacing.sm },
  sectionTitle: {
    ...Typography.label,
    color: Palette.greyMid,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm,
    gap: Spacing.md,
  },
  rowText: { flex: 1, gap: 2 },
  rowLabel: { ...Typography.bodyBold, color: Palette.black },
  rowHint: { color: Palette.greyMid, fontSize: 12 },
  helper: { color: Palette.greyDark, fontWeight: '600' },
  note: { color: Palette.greyMid, fontSize: 12, fontStyle: 'italic' },
  makenDraaienRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.lg,
    justifyContent: 'center',
  },
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
  radioSelected: { borderColor: Palette.blueDark },
  radioInner: { width: 12, height: 12, borderRadius: 6, backgroundColor: Palette.blueDark },
  spelersLabel: { ...Typography.body, color: Palette.black },
});
