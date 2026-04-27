import { StyleSheet, Text, View } from 'react-native';
import { RegelSectie } from '@/components/spelregels/regel-sectie';
import { Screen } from '@/components/ui/screen';
import { Palette, Radius, Spacing, Typography } from '@/constants/theme';

const KAARTWAARDEN: { rang: string; troef: string; nietTroef: string }[] = [
  { rang: 'Boer (jas)', troef: '20', nietTroef: '2' },
  { rang: 'Negen (nel)', troef: '14', nietTroef: '0' },
  { rang: 'Aas', troef: '11', nietTroef: '11' },
  { rang: 'Tien', troef: '10', nietTroef: '10' },
  { rang: 'Heer', troef: '4', nietTroef: '4' },
  { rang: 'Vrouw', troef: '3', nietTroef: '3' },
  { rang: 'Acht', troef: '0', nietTroef: '0' },
  { rang: 'Zeven', troef: '0', nietTroef: '0' },
];

const ROEM_TABEL: { naam: string; punten: string }[] = [
  { naam: 'Driekaart (3 op rij, zelfde kleur)', punten: '20' },
  { naam: 'Vierkaart (4 op rij, zelfde kleur)', punten: '50' },
  { naam: 'Vier gelijken (A, 10, H, V)', punten: '100' },
  { naam: 'Vier boeren', punten: '200' },
  { naam: 'Stuk (Heer + Vrouw van troef)', punten: '20' },
  { naam: 'Pit (alle slagen)', punten: '+100' },
];

export default function Spelregels() {
  return (
    <Screen scroll>
      <Text style={styles.intro}>
        Klaverjas is een Nederlands kaartspel voor 2, 3 of 4 spelers met 32 kaarten.
        Hieronder vind je de regels voor elke variant en alle achtergrondinformatie.
      </Text>

      <RegelSectie title="Varianten naar aantal spelers" defaultOpen>
        <Bullet>
          <Bold>4 spelers (klassiek):</Bold> 2 tegen 2, maten zitten tegenover elkaar.
          Klokwijs spelen. Scores per team (Wij / Zij).
        </Bullet>
        <Bullet>
          <Bold>3 spelers (ieder voor zich):</Bold> de troefmaker speelt alleen tegen de
          andere twee. Iedereen heeft een eigen score. Wie gaat moet meer dan 81 punten halen
          om te maken. Bij nat krijgen de andere twee samen 162 + roem (gelijk verdeeld).
        </Bullet>
        <Bullet>
          <Bold>2 spelers (1-vs-1):</Bold> klassieke 1 tegen 1. Elk 8 kaarten, scoring per speler.
        </Bullet>
      </RegelSectie>

      <RegelSectie title="Basisregels">
        <Bullet>32 piket-kaarten, 4 kleuren: <Bold>klaver</Bold>, <Bold>hart</Bold>, <Bold>schoppen</Bold>, <Bold>ruiten</Bold>.</Bullet>
        <Bullet>Iedere speler krijgt 8 kaarten. Delen 3-2-3 of 4-4.</Bullet>
        <Bullet>Een <Bold>boompje</Bold> = 16 giffies (of: spelen tot 1000 / 1500 punten).</Bullet>
        <Bullet>Een <Bold>giffie</Bold> = één gespeeld spel (één rondje van 8 slagen).</Bullet>
        <Bullet>Iedere speler deelt evenveel keer (bij 4 spelers: 4× per boompje).</Bullet>
      </RegelSectie>

      <RegelSectie title="Kaartwaarden & rangorde">
        <Text style={styles.body}>
          Totaal <Bold>162 punten</Bold> per giffie: 62 troef + 90 niet-troef + 10 voor de
          laatste slag.
        </Text>
        <View style={styles.tabel}>
          <View style={[styles.tabelRow, styles.tabelHeader]}>
            <Text style={[styles.tabelCell, styles.tabelHeaderText, styles.colKaart]}>Kaart</Text>
            <Text style={[styles.tabelCell, styles.tabelHeaderText]}>Troef</Text>
            <Text style={[styles.tabelCell, styles.tabelHeaderText]}>Niet-troef</Text>
          </View>
          {KAARTWAARDEN.map((row) => (
            <View key={row.rang} style={styles.tabelRow}>
              <Text style={[styles.tabelCell, styles.colKaart]}>{row.rang}</Text>
              <Text style={styles.tabelCell}>{row.troef}</Text>
              <Text style={styles.tabelCell}>{row.nietTroef}</Text>
            </View>
          ))}
        </View>
        <Text style={styles.note}>
          Voor roem-volgorde (drie/vierkaart) geldt de standaard A-H-V-B-10-9-8-7, niet de
          klaverjas-rangorde.
        </Text>
      </RegelSectie>

      <RegelSectie title="Roem">
        <View style={styles.tabel}>
          {ROEM_TABEL.map((row) => (
            <View key={row.naam} style={styles.tabelRow}>
              <Text style={[styles.tabelCell, styles.colKaart]}>{row.naam}</Text>
              <Text style={[styles.tabelCell, styles.tabelStrong]}>{row.punten}</Text>
            </View>
          ))}
        </View>
        <Bullet>
          Bij driekaart of vierkaart waarin het stuk zit: <Bold>optellen</Bold> (bv. 20 + 20 = 40).
        </Bullet>
        <Bullet>Stuk telt altijd en is nooit af te keuren.</Bullet>
      </RegelSectie>

      <RegelSectie title="Nat (beet)">
        <Bullet>
          De spelende partij moet <Bold>meer dan 81 punten</Bold> (incl. roem) halen om te maken.
        </Bullet>
        <Bullet>
          Bij gelijk of minder is de spelende partij <RedText>nat</RedText>: 0 punten voor hen,
          de tegenpartij krijgt <Bold>162 + alle roem</Bold>.
        </Bullet>
        <Bullet>
          Bij 3 spelers (ieder voor zich): bij nat verdelen de andere twee de 162 + roem
          gelijk over beiden.
        </Bullet>
      </RegelSectie>

      <RegelSectie title="Troefplicht (Amsterdams vs Rotterdams)">
        <Text style={styles.body}>
          Twee scholen voor wat je <Bold>moet</Bold> spelen als je een kleur niet meer hebt.
        </Text>
        <Bullet>
          <Bold>Amsterdams:</Bold> hoef je niet over te troeven als de slag al voor je maat
          ligt.
        </Bullet>
        <Bullet>
          <Bold>Rotterdams:</Bold> moet altijd in/over­troeven als je de gevraagde kleur niet
          hebt.
        </Bullet>
        <Text style={styles.note}>
          Bij troef gevraagd geldt voor beide varianten: bekennen → overtroeven → ondertroeven →
          anders spelen.
        </Text>
      </RegelSectie>

      <RegelSectie title="Bied-varianten">
        <Bullet>
          <Bold>Klassiek (gedraaid):</Bold> troefkaart wordt omgedraaid; spelers zeggen
          &quot;pas&quot; of &quot;speel&quot; (linksom vanaf deler).
        </Bullet>
        <Bullet>
          <Bold>Verplicht / Utrechts:</Bold> voorhand kiest verplicht een troef en komt uit.
        </Bullet>
        <Bullet>
          <Bold>Leids:</Bold> bieden zoals bij bridge. Bod 2+ verhoogt de nat-grens met 10 per
          niveau. Met &quot;strik&quot; krijg je +100 als de spelende partij nat gaat.
        </Bullet>
        <Bullet>
          <Bold>Verplichte draai:</Bold> na rondpassen speelt de speler &quot;ervoor&quot;
          op de eerstvolgende draaikaart.
        </Bullet>
      </RegelSectie>

      <RegelSectie title="Variant-modifiers">
        <Bullet>
          <Bold>Roem in de hand:</Bold> melden vóór de 2e slag. Alleen het koppel met de hoogste
          individuele roem krijgt punten.
        </Bullet>
        <Bullet>
          <Bold>Kraken / contra:</Bold> tegenpartij verdubbelt de inzet. Re/superkraak ×4 / ×8.
        </Bullet>
        <Bullet>
          <Bold>Schoppen dubbel:</Bold> als schoppen troef is → puntenwaarden ×2 (roem niet).
        </Bullet>
        <Bullet>
          <Bold>Pit:</Bold> alle slagen door de spelende partij → +100.
        </Bullet>
      </RegelSectie>

      <RegelSectie title="Verzaken">
        <Text style={styles.body}>
          Verzaken = een fout maken: niet bekennen, niet troeven, ondertroeven terwijl je
          hoger kan, etc.
        </Text>
        <Bullet>
          Sanctie hangt af van afspraak: spel verloren of nat + 100 strafpunten ={' '}
          <RedText>262 tegen</RedText>.
        </Bullet>
        <Bullet>
          Bekennen weegt zwaarder dan het verbod op ondertroeven: bij troef gevraagd moet je
          bekennen, ook als je alleen kunt ondertroeven.
        </Bullet>
      </RegelSectie>

      <RegelSectie title="Seinen (conventies)">
        <Bullet>
          <Bold>Kleine kaart bijspelen</Bold> in andere kleur → ik heb het aas / wil deze kleur.
        </Bullet>
        <Bullet>
          <Bold>Plaatje bijspelen</Bold> (10/H/V/B) → ik heb niets/weinig in deze kleur.
        </Bullet>
        <Bullet>
          <Bold>Kleintje boer:</Bold> uitkomen met niet-troef 7/8/9 → ik heb de troefboer,
          speel troef terug.
        </Bullet>
        <Bullet>
          <Bold>Kleintje boer, kleintje terug:</Bold> maat speelt ander niet-troefkleintje →
          ik heb een kale nel, speel troef terug (geen boer).
        </Bullet>
        <Bullet>
          <Bold>Boer over boer:</Bold> uitkomen met niet-troef boer → ik heb troefboer + alleen
          kleine troeven.
        </Bullet>
        <Bullet>
          <Bold>Tegenkleur seinen:</Bold> harten sein = wil ruiten; klaver sein = wil schoppen.
        </Bullet>
      </RegelSectie>
    </Screen>
  );
}

function Bullet({ children }: { children: React.ReactNode }) {
  return (
    <View style={styles.bulletRow}>
      <View style={styles.bulletDot} />
      <Text style={styles.bulletText}>{children}</Text>
    </View>
  );
}

function Bold({ children }: { children: React.ReactNode }) {
  return <Text style={styles.bold}>{children}</Text>;
}

function RedText({ children }: { children: React.ReactNode }) {
  return <Text style={styles.red}>{children}</Text>;
}

const styles = StyleSheet.create({
  intro: {
    ...Typography.body,
    color: Palette.greyDark,
    marginBottom: Spacing.lg,
  },
  body: { ...Typography.body, color: Palette.black },
  bulletRow: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.sm },
  bulletDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Palette.blueDark,
    marginTop: 9,
  },
  bulletText: { ...Typography.body, color: Palette.black, flex: 1, lineHeight: 22 },
  bold: { fontWeight: '700', color: Palette.blueDark },
  red: { color: Palette.redAction, fontWeight: '700' },
  note: { ...Typography.caption, color: Palette.greyMid, fontStyle: 'italic' },
  tabel: {
    backgroundColor: Palette.white,
    borderRadius: Radius.sm,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Palette.greyLight,
  },
  tabelRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: Palette.greyLight,
  },
  tabelHeader: { backgroundColor: Palette.blueVeryLight },
  tabelHeaderText: { fontWeight: '700', color: Palette.blueDark },
  tabelCell: {
    flex: 1,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.sm,
    color: Palette.black,
    fontSize: 14,
  },
  tabelStrong: { fontWeight: '700' },
  colKaart: { flex: 2 },
});
