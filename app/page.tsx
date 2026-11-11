"use client";

import { useEffect, useState } from "react";

type Pokemon = {
  id: number; name: string; type?: string;
  types?: string[] | { type: { name: string } }[];
  image?: string; imageUrl?: string; sprite?: string;
  hp?: number; attack?: number; defense?: number;
};

const typeColors: Record<string, string> = {
  fire: "bg-orange-500", water: "bg-blue-500", grass: "bg-green-500",
  electric: "bg-yellow-400 text-black", psychic: "bg-pink-500",
  ice: "bg-cyan-300 text-black", dragon: "bg-purple-600", dark: "bg-zinc-800",
  fairy: "bg-pink-300 text-black", normal: "bg-zinc-400 text-black",
  fighting: "bg-red-700", flying: "bg-sky-300 text-black", poison: "bg-purple-500",
  ground: "bg-amber-600", rock: "bg-stone-500", bug: "bg-lime-500",
  ghost: "bg-violet-600", steel: "bg-slate-400 text-black",
};

function getTypes(p: Pokemon): string[] {
  if (Array.isArray(p.types)) return p.types.map((t: any) => typeof t === "string" ? t : t.type?.name || t.name).filter(Boolean);
  if (p.type) return [p.type];
  return ["normal"];
}
function getImage(p: Pokemon): string {
  return p.image || p.imageUrl || p.sprite || `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${p.id}.png`;
}
function playSound(win: boolean = false) {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const o = ctx.createOscillator(); const g = ctx.createGain();
    o.connect(g); g.connect(ctx.destination);
    o.frequency.value = win ? 880 : 600;
    o.type = 'sine'; g.gain.value = 0.15;
    o.start(); o.stop(ctx.currentTime + 0.2);
    if (win) { setTimeout(() => { const o2 = ctx.createOscillator(); o2.connect(g); o2.frequency.value = 1200; o2.start(); o2.stop(ctx.currentTime + 0.3); }, 200); }
  } catch {}
}

export default function Home() {
  const [pokemons, setPokemons] = useState<Pokemon[]>([]);
  const [search, setSearch] = useState('');
  const [favoris, setFavoris] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [voirFavorisSeulement, setVoirFavorisSeulement] = useState(false);
  const [selected, setSelected] = useState<Pokemon | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [newName, setNewName] = useState(''); const [newType, setNewType] = useState('fire'); const [newHp, setNewHp] = useState(50);
  const [dark, setDark] = useState(true);

  // COMBAT
  const [showCombat, setShowCombat] = useState(false);
  const [idx1, setIdx1] = useState<number>(-1);
  const [idx2, setIdx2] = useState<number>(-1);
  const [hp1, setHp1] = useState(100); const [hp2, setHp2] = useState(100);
  const [log, setLog] = useState<string[]>([]); const [winner, setWinner] = useState<string | null>(null);
  const [combatStarted, setCombatStarted] = useState(false);
  const [anim1, setAnim1] = useState('');
  const [anim2, setAnim2] = useState('');
  const [boom, setBoom] = useState('');

  const fighter1 = idx1 >= 0 ? pokemons[idx1] : null;
  const fighter2 = idx2 >= 0 ? pokemons[idx2] : null;

  useEffect(() => { const s = localStorage.getItem('mes-favoris'); if (s) setFavoris(JSON.parse(s)); }, []);
  const toggleFavori = (id: any) => { let n: any[]; if (favoris.includes(id)) n = favoris.filter(f => f !== id); else { n = [...favoris, id]; playSound(); } setFavoris(n); localStorage.setItem('mes-favoris', JSON.stringify(n)); };
  useEffect(() => { fetch(`${process.env.NEXT_PUBLIC_API_URL}/pokemons`).then(r => r.json()).then(data => { const list = Array.isArray(data) ? data : data.pokemons || data.data || []; setPokemons(list); setLoading(false); }).catch(() => setLoading(false)); }, []);

  const ajouterPokemon = async (e: any) => {
    e.preventDefault(); if (!newName) return;
    const np: Pokemon = { id: Date.now(), name: newName, type: newType, types: [newType], hp: newHp, attack: 50, defense: 50, image: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png` };
    try {
  const token = localStorage.getItem('token');
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/pokemons`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ name: newName, type: newType, hp: newHp })
  });

  if (res.ok) {
    const saved = await res.json();
    setPokemons([...pokemons, saved]);
  } else {
    alert('Tu dois être connecté pour créer un Pokémon');
  }
} catch {
  alert('Erreur, tu dois être connecté');
}
    setNewName(''); setNewHp(50); setShowForm(false); playSound(true); alert(newName + ' ajouté ! 🎉');
  };

  const startCombat = () => {
    if (!fighter1 || !fighter2) { alert('Choisis 2 combattants d’abord !'); return; }
    if (idx1 === idx2) { alert('Choisis 2 Pokémons différents !'); return; }
    setHp1(fighter1.hp || 100); setHp2(fighter2.hp || 100);
    setLog([`⚔️ ${fighter1.name} VS ${fighter2.name} - FIGHT !`]);
    setWinner(null); setCombatStarted(true); playSound();
  };

  const attaquer = (qui: number) => {
    if (!fighter1 || !fighter2 || winner) return;

    // ANIMATION : Attaquant avance, défenseur tremble + explosion
    if (qui === 1) {
      setAnim1('translate-x-10 scale-125 rotate-6');
      setAnim2('animate-bounce -translate-x-4 scale-90');
      setBoom('left');
    } else {
      setAnim2('-translate-x-10 scale-125 -rotate-6');
      setAnim1('animate-bounce translate-x-4 scale-90');
      setBoom('right');
    }
    setTimeout(() => { setAnim1(''); setAnim2(''); setBoom(''); }, 500);

    const atk = qui === 1 ? (fighter1.attack || 50) : (fighter2.attack || 50);
    const def = qui === 1 ? (fighter2.defense || 20) : (fighter1.defense || 20);
    const degats = Math.max(5, atk - Math.floor(def / 2) + Math.floor(Math.random() * 20));
    playSound();
    if (qui === 1) {
      const newHp = Math.max(0, hp2 - degats);
      setHp2(newHp);
      if (newHp <= 0) { setWinner(fighter1.name); playSound(true); setLog([...log, `💥 ${fighter1.name} frappe ! -${degats} HP`, `🏆 ${fighter1.name} GAGNE !`]); }
      else setLog([...log, `💥 ${fighter1.name} frappe ! -${degats} HP`]);
    } else {
      const newHp = Math.max(0, hp1 - degats);
      setHp1(newHp);
      if (newHp <= 0) { setWinner(fighter2.name); playSound(true); setLog([...log, `💥 ${fighter2.name} frappe ! -${degats} HP`, `🏆 ${fighter2.name} GAGNE !`]); }
      else setLog([...log, `💥 ${fighter2.name} frappe ! -${degats} HP`]);
    }
  };

  let filtered = pokemons.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));
  if (voirFavorisSeulement) filtered = filtered.filter(p => favoris.includes(p.id));

  const bg = dark ? "bg-[#0f0f1a] text-white" : "bg-yellow-50 text-black";
  const cardBg = dark ? "bg-zinc-900 border-zinc-800" : "bg-white border-yellow-200 shadow-lg";

  return (
    <main className={`min-h-screen ${bg} p-6 transition-colors`}>
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center"><div className="w-20"></div><h1 className="text-5xl font-black text-center tracking-tight">POKÉ<span className="text-yellow-400">DEX</span></h1><button onClick={() => { setDark(!dark); playSound(); }} className="px-4 py-2 rounded-full bg-zinc-800 text-white font-bold">{dark ? '☀️ Clair' : '🌙 Sombre'}</button></div>
        <p className={`text-center mt-2 mb-8 ${dark ? 'text-zinc-400' : 'text-zinc-600'}`}>Ton Pokédex personnel • {pokemons.length} Pokémons • ⭐ {favoris.length} Favoris</p>

        <div className="flex flex-wrap gap-3 justify-center mb-6">
          <button onClick={() => setVoirFavorisSeulement(!voirFavorisSeulement)} className={`px-5 py-2 rounded-full font-bold ${voirFavorisSeulement ? 'bg-amber-400 text-black' : 'bg-zinc-800 text-white'}`}>{voirFavorisSeulement ? '⭐ Voir Tous' : '⭐ Voir que mes Favoris'}</button>
          <button onClick={() => setShowForm(!showForm)} className={`px-5 py-2 rounded-full font-bold ${showForm ? 'bg-zinc-700 text-white' : 'bg-green-500 text-black'}`}>{showForm ? '❌ Fermer' : '➕ Ajouter un Pokémon'}</button>
          <button onClick={() => setShowCombat(!showCombat)} className={`px-5 py-2 rounded-full font-bold ${showCombat ? 'bg-zinc-700 text-white' : 'bg-purple-600 text-white'}`}>{showCombat ? '❌ Fermer Combat' : '⚔️ MODE COMBAT'}</button>
          <button onClick={() => { localStorage.removeItem('token'); window.location.reload(); }} className="px-5 py-2 rounded-full font-bold bg-red-600 text-white">🚶‍♂️ Déconnexion</button>
        </div>

        {showForm && (<form onSubmit={ajouterPokemon} className={`max-w-md mx-auto border rounded-3xl p-5 mb-8 space-y-3 ${cardBg}`}><h3 className="font-bold text-xl text-center">Nouveau Pokémon</h3><input value={newName} onChange={e => setNewName(e.target.value)} placeholder="Nom : Ex: Rayquaza" className="w-full bg-zinc-800 text-white rounded-xl px-4 py-2 outline-none" /><select value={newType} onChange={e => setNewType(e.target.value)} className="w-full bg-zinc-800 text-white rounded-xl px-4 py-2"><option value="fire">🔥 Feu</option><option value="water">💧 Eau</option><option value="grass">🌿 Plante</option><option value="electric">⚡ Électrique</option><option value="psychic">🔮 Psy</option><option value="dragon">🐉 Dragon</option></select><div className="flex gap-2 items-center"><span>HP ❤️</span><input type="number" value={newHp} onChange={e => setNewHp(Number(e.target.value))} className="flex-1 bg-zinc-800 text-white rounded-xl px-4 py-2" /></div><button className="w-full bg-yellow-400 text-black font-bold py-2 rounded-xl">Ajouter !</button></form>)}

        {showCombat && (
          <div className={`max-w-2xl mx-auto border-2 border-red-500 rounded-3xl p-5 mb-8 ${cardBg}`}>
            <h3 className="font-black text-2xl text-center">⚔️ ARÈNE DE COMBAT ⚔️</h3>
            <div className="flex gap-3 justify-center mt-4">
              <select value={idx1} onChange={e => { setIdx1(Number(e.target.value)); setCombatStarted(false); setWinner(null); setLog([]); }} className="flex-1 bg-zinc-800 text-white rounded-xl px-3 py-2"><option value={-1}>Combattant 1...</option>{pokemons.map((p, i) => <option key={i} value={i}>{p.name}</option>)}</select>
              <span className="text-2xl font-black">VS</span>
              <select value={idx2} onChange={e => { setIdx2(Number(e.target.value)); setCombatStarted(false); setWinner(null); setLog([]); }} className="flex-1 bg-zinc-800 text-white rounded-xl px-3 py-2"><option value={-1}>Combattant 2...</option>{pokemons.map((p, i) => <option key={i} value={i}>{p.name}</option>)}</select>
            </div>

            <p className="text-center text-sm mt-2 text-zinc-400">Choisi : {fighter1 ? fighter1.name : '...'} VS {fighter2 ? fighter2.name : '...'}</p>

            <button onClick={startCombat} className="w-full bg-red-500 text-white font-bold py-2 rounded-xl mt-3">🥊 COMMENCER LE COMBAT !</button>

            {fighter1 && fighter2 && (
              <div className="relative grid grid-cols-2 gap-4 mt-4">
                {boom && <div className="absolute left-1/2 top-10 -translate-x-1/2 text-6xl animate-ping z-10">💥</div>}
                {boom && <div className="absolute left-1/2 top-10 -translate-x-1/2 text-6xl z-10">💥</div>}
                <div className="text-center"><img src={getImage(fighter1)} className={`w-28 h-28 mx-auto transition-all duration-300 ${anim1}`} /><p className="font-bold capitalize">{fighter1.name}</p><div className="bg-zinc-800 rounded-full h-4 overflow-hidden mt-1"><div className="bg-green-500 h-4 transition-all duration-500" style={{ width: `${Math.min(hp1, 100)}%` }}></div></div><p>HP: {hp1} / {fighter1.hp || 100}</p><button onClick={() => attaquer(1)} disabled={!combatStarted || !!winner} className="mt-2 bg-orange-500 px-4 py-1 rounded-full font-bold disabled:opacity-50 active:scale-90">⚔️ Attaquer !</button></div>
                <div className="text-center"><img src={getImage(fighter2)} className={`w-28 h-28 mx-auto transition-all duration-300 ${anim2}`} /><p className="font-bold capitalize">{fighter2.name}</p><div className="bg-zinc-800 rounded-full h-4 overflow-hidden mt-1"><div className="bg-green-500 h-4 transition-all duration-500" style={{ width: `${Math.min(hp2, 100)}%` }}></div></div><p>HP: {hp2} / {fighter2.hp || 100}</p><button onClick={() => attaquer(2)} disabled={!combatStarted || !!winner} className="mt-2 bg-blue-500 px-4 py-1 rounded-full font-bold disabled:opacity-50 active:scale-90">⚔️ Attaquer !</button></div>
              </div>
            )}
            {winner && <p className="text-center text-3xl font-black text-yellow-400 mt-4 animate-bounce">🏆 {winner} GAGNE ! 🏆</p>}
            <div className="mt-4 space-y-1 text-sm max-h-32 overflow-y-auto">{log.map((l, i) => <p key={i}>{l}</p>)}</div>
          </div>
        )}

        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍 Rechercher Pikachu, Bulbasaur..." className="w-full max-w-md mx-auto block bg-zinc-800 text-white border border-zinc-700 rounded-full px-5 py-3 outline-none focus:border-yellow-400 mb-10" />
        {loading ? <p className="text-center text-2xl animate-pulse">Chargement...</p> : filtered.length === 0 ? <p className="text-center">Aucun Pokémon trouvé 😢</p> : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {filtered.map((p, index) => { const types = getTypes(p); return (<div key={p.id} onClick={() => { setSelected(p); playSound(); }} className={`${cardBg} border rounded-3xl p-4 hover:scale-[1.03] hover:border-yellow-400 transition cursor-pointer overflow-hidden`}><div className="flex justify-between items-start"><span className="text-zinc-500 font-bold">#{String(index + 1).padStart(3, "0")}</span><button onClick={e => { e.stopPropagation(); toggleFavori(p.id); }} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '20px' }}>{favoris.includes(p.id) ? '⭐' : '☆'}</button></div><img src={getImage(p)} alt={p.name} className="w-36 h-36 mx-auto object-contain" /><h2 className="text-xl font-bold capitalize text-center mt-2">{p.name}</h2><div className="flex gap-2 justify-center mt-3 flex-wrap">{types.map(t => <span key={t} className={`px-3 py-1 rounded-full text-xs font-bold capitalize text-white ${typeColors[t.toLowerCase()] || "bg-zinc-600"}`}>{t}</span>)}</div><p className="text-center text-xs text-yellow-400 mt-3">👆 Clique pour voir la carte</p></div>); })}
          </div>
        )}
      </div>
      {selected && (<div onClick={() => setSelected(null)} className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50"><div onClick={e => e.stopPropagation()} className="bg-zinc-900 text-white border-2 border-yellow-400 rounded-3xl p-6 max-w-sm w-full text-center relative"><button onClick={() => setSelected(null)} className="absolute top-3 right-4 text-2xl">❌</button><img src={getImage(selected)} className="w-56 h-56 mx-auto" /><h2 className="text-3xl font-black capitalize">{selected.name}</h2><div className="flex gap-2 justify-center mt-3">{getTypes(selected).map(t => <span key={t} className={`px-4 py-1 rounded-full text-sm font-bold capitalize ${typeColors[t.toLowerCase()] || "bg-zinc-600"}`}>{t}</span>)}</div><div className="mt-5 space-y-3 text-left"><div><div className="flex justify-between text-sm"><span>HP ❤️</span><span>{selected.hp || 50}</span></div><div className="bg-zinc-800 rounded-full h-3 overflow-hidden"><div className="bg-red-500 h-3" style={{ width: `${Math.min((selected.hp || 50), 100)}%` }}></div></div></div><div><div className="flex justify-between text-sm"><span>Attaque ⚔️</span><span>{selected.attack || 50}</span></div><div className="bg-zinc-800 rounded-full h-3 overflow-hidden"><div className="bg-orange-500 h-3" style={{ width: `${Math.min((selected.attack || 50), 100)}%` }}></div></div></div><div><div className="flex justify-between text-sm"><span>Défense 🛡️</span><span>{selected.defense || 50}</span></div><div className="bg-zinc-800 rounded-full h-3 overflow-hidden"><div className="bg-blue-500 h-3" style={{ width: `${Math.min((selected.defense || 50), 100)}%` }}></div></div></div></div><button onClick={() => toggleFavori(selected.id)} className="mt-6 w-full bg-yellow-400 text-black font-bold py-3 rounded-xl">{favoris.includes(selected.id) ? '⭐ Retirer des favoris' : '☆ Ajouter aux favoris'}</button></div></div>)}
    </main>
  );
}