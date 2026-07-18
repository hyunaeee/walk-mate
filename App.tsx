import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import HomeScreen from './src/screens/HomeScreen';
import MapScreen from './src/screens/MapScreen';
import OnboardingScreen from './src/screens/OnboardingScreen';
import type { WalkRoute } from './src/data/routes';
import { loadPrefs, Prefs, savePrefs } from './src/prefs';
import { C } from './src/theme';

export default function App() {
  const [booting, setBooting] = useState(true);
  const [prefs, setPrefs] = useState<Prefs | null>(null);
  const [editingPrefs, setEditingPrefs] = useState(false);
  const [selected, setSelected] = useState<WalkRoute | null>(null);

  useEffect(() => {
    loadPrefs().then((p) => {
      setPrefs(p);
      setBooting(false);
    });
  }, []);

  const updatePrefs = (p: Prefs) => {
    setPrefs(p);
    savePrefs(p);
  };

  let screen: React.ReactNode;
  if (booting) {
    screen = <View style={{ flex: 1, backgroundColor: C.paper }} />;
  } else if (!prefs || editingPrefs) {
    screen = (
      <OnboardingScreen
        initial={prefs}
        onDone={(p) => {
          updatePrefs(p);
          setEditingPrefs(false);
        }}
      />
    );
  } else if (selected) {
    screen = <MapScreen route={selected} onBack={() => setSelected(null)} />;
  } else {
    screen = (
      <HomeScreen
        prefs={prefs}
        onSelect={setSelected}
        onUpdatePrefs={updatePrefs}
        onEditPrefs={() => setEditingPrefs(true)}
      />
    );
  }

  return (
    <>
      <StatusBar style="dark" />
      {screen}
    </>
  );
}
