"use client";

import { useMemo, useState } from "react";

type Wine = {
  name: string;
  category: string;
  region: string;
  grape: string;
  colorName: string;
  color: string;
  body: string;
  style: string;
  structure: Record<string, number>;
  aroma: string[];
  taste: string[];
  texture: string;
  finish: string;
  place: string;
  method: string;
  pairing: string;
  bridge: string;
  selling: string;
  hook: string;
  note?: string;
};

const wines: Wine[] = [
  {name:"Prosecco — Ronco Belvedere",category:"Sparkling",region:"Veneto",grape:"100% Glera",colorName:"Pale straw yellow",color:"#e9df9c",body:"Light-bodied",style:"Crisp, fresh, lively",structure:{Body:25,Acidity:72,Sweetness:20,Tannin:0,Bubbles:78},aroma:["green apple","pear","honeydew","white flowers"],taste:["apple","pear","citrus","melon"],texture:"Light and refreshing with soft, lively bubbles.",finish:"Fresh, clean and palate-cleansing.",place:"Veneto’s cooler northern influence helps preserve Glera’s freshness and delicate fruit.",method:"The second fermentation happens in a pressurized tank, preserving fruit and floral aromas.",pairing:"Calamari Fritti con Zucchine — bubbles cut through fried richness.",bridge:"I want something light, refreshing, or easy to start with.",selling:"Light, crisp Veneto Prosecco with soft bubbles and apple-and-pear freshness.",hook:"Soft party bubbles that clean the palate."},
  {name:"Spumante Rosato — Serafini & Vidotto",category:"Sparkling rosé",region:"Veneto",grape:"Chardonnay + Pinot Noir",colorName:"Light salmon pink",color:"#e9a5a3",body:"Light-to-medium",style:"Dry, fruity, floral",structure:{Body:38,Acidity:74,Sweetness:22,Tannin:4,Bubbles:80},aroma:["strawberry","raspberry","pomegranate","rose"],taste:["red berries","citrus","strawberry","dry fruit"],texture:"Velvety and lively with fine bubbles.",finish:"Dry, fruity and citrusy.",place:"Northern Veneto’s hills provide freshness and delicate red-fruit character.",method:"Pinot Noir contributes pink color and berries; Chardonnay contributes freshness and structure.",pairing:"Bruschetta con Ricotta e Miele al Tartufo — fruit balances ricotta, honey and truffle.",bridge:"I like rosé, but I want bubbles and I do not want it sweet.",selling:"Dry pink bubbles with strawberry, pomegranate and floral freshness.",hook:"Pink bubbles: berries and roses, dry—not sweet.",note:"Confirm the exact current blend from the bottle label before quoting percentages."},
  {name:"Ferrari Trento DOC Brut",category:"Traditional-method sparkling",region:"Trentino",grape:"100% Chardonnay",colorName:"Bright golden straw",color:"#d8bd60",body:"Medium-bodied",style:"Dry, refined, toasty",structure:{Body:48,Acidity:84,Sweetness:12,Tannin:0,Bubbles:94},aroma:["golden apple","white flowers","yeast","bread crust"],taste:["apple","citrus","almond","toast"],texture:"Creamy and refined with very fine persistent bubbles.",finish:"Longer, toasted and complex.",place:"Cool Alpine vineyards preserve acidity while sunny mountain slopes ripen Chardonnay.",method:"Bottle fermentation and lees aging create fine bubbles, yeast, toast and bread aromas.",pairing:"Burrata alla Caprese — acidity refreshes creamy burrata.",bridge:"Do you have Champagne? / I want a premium sparkling wine.",selling:"Premium Italian sparkling Chardonnay with fine bubbles, apple and elegant toasted notes.",hook:"Mountain. Toast. Fine bubbles."},
  {name:"Verdicchio “Villa Marilla” — Marco Gatti",category:"Still white",region:"Marche",grape:"100% Verdicchio",colorName:"Pale straw with green hints",color:"#dfe6a4",body:"Medium-bodied",style:"Mineral, citrusy, saline",structure:{Body:48,Acidity:86,Sweetness:8,Tannin:0,Bubbles:0},aroma:["lemon","green apple","almond","wet stone"],taste:["citrus","saline mineral","almond","stone fruit"],texture:"Smooth with energetic acidity and slight oiliness.",finish:"Persistent, mineral, saline and almond-like.",place:"Marche’s limestone-rich soils and temperature changes support acidity and mineral character.",method:"Generally fermented in stainless steel to preserve citrus, almond and mineral flavors.",pairing:"Trofie al Pesto di Basilico — almond and citrus complement pesto.",bridge:"I normally drink Sauvignon Blanc.",selling:"Bright mineral Verdicchio with lemon, saline freshness and an almond finish.",hook:"Lemon, stone, salt and almond.",note:"Trainer shorthand called it coastal; Matelica is inland. Sell the saline character rather than saying the vineyard is directly on the sea."},
  {name:"Pinot Grigio — Attems",category:"Still white",region:"Friuli-Venezia Giulia",grape:"100% Pinot Grigio",colorName:"Soft straw yellow",color:"#e6d995",body:"Light-to-medium",style:"Dry, bright, approachable",structure:{Body:42,Acidity:72,Sweetness:8,Tannin:0,Bubbles:0},aroma:["white plum","pear","peach","lime blossom"],taste:["pear","white peach","lemon zest","green almond"],texture:"Clean, smooth and slightly velvety.",finish:"Balanced, fresh and softly mineral.",place:"Friuli lies between the Alps and Adriatic, creating freshness and savory mineral notes.",method:"Cool fermentation preserves fruit and floral aromas; lees contact may add texture.",pairing:"Insalata di Rucola — citrus freshness lifts peppery arugula.",bridge:"I just want an easy, dry white wine.",selling:"A dry, bright Pinot Grigio with pear, white peach and a clean finish.",hook:"Bright, zesty and reliable."},
  {name:"Gavi di Gavi — Fontanafredda",category:"Still white",region:"Piemonte",grape:"100% Cortese",colorName:"Straw yellow with green hints",color:"#d9dd93",body:"Medium-bodied",style:"Dry, lean, elegant",structure:{Body:44,Acidity:82,Sweetness:6,Tannin:0,Bubbles:0},aroma:["green apple","Meyer lemon","lime zest","acacia"],taste:["green apple","citrus","almond","mineral"],texture:"Lean, steely and polished.",finish:"Lingering, delicate and mineral.",place:"The hills around Gavi have marl and sandstone soils that help Cortese retain freshness.",method:"Gentle pressing, cool steel fermentation and short fine-lees aging.",pairing:"Salmone alla Griglia — clean minerality complements grilled fish.",bridge:"I want an elegant, mineral white / I like Chablis-style wines.",selling:"Dry, elegant Cortese with green apple, citrus and a clean mineral finish.",hook:"Clean, lean and steely—the elegant fish white."},
  {name:"Chianti Classico — Colombaio di Cencio",category:"Red",region:"Toscana",grape:"Sangiovese",colorName:"Deep ruby red",color:"#7f1d2d",body:"Medium-to-full",style:"Bright, savory, structured",structure:{Body:66,Acidity:80,Sweetness:5,Tannin:64,Bubbles:0},aroma:["violet","rose","cherry","savory herbs"],taste:["cherry","roasted tomato","oregano","espresso"],texture:"Firm but balanced with lively acidity and fine tannins.",finish:"Persistent, tangy, savory and mineral.",place:"The Tuscan hills combine sunshine, elevation and limestone-rich soils.",method:"Skin fermentation extracts color and tannin; barrel aging adds savory complexity.",pairing:"Tagliatelle alla Bolognese — acidity cuts through rich ragù.",bridge:"I want a classic Italian red for pasta, tomato sauce or meat.",selling:"Classic Tuscan Sangiovese with bright cherry, herbs and food-friendly acidity.",hook:"Under the Tuscan sun: cherry, herbs and acidity."},
  {name:"Montepulciano d’Abruzzo — Fontezoppa",category:"Red",region:"Abruzzo",grape:"100% Montepulciano",colorName:"Intense ruby with violet hints",color:"#5d1830",body:"Full-bodied",style:"Bold, smooth, dark-fruited",structure:{Body:80,Acidity:62,Sweetness:7,Tannin:56,Bubbles:0},aroma:["red plum","blackberry","cherry","dried thyme"],taste:["plum","blackberry","baking spice","subtle oak"],texture:"Rich, juicy and smooth with medium tannins.",finish:"Lingering, dark-fruited and gently spicy.",place:"Abruzzo lies between the Adriatic and Apennine Mountains, balancing ripe fruit with freshness.",method:"Skin fermentation develops color and tannin; oak influence adds spice and softens texture.",pairing:"Diavola Pizza — ripe fruit softens spicy salami.",bridge:"I like Cabernet or Merlot and want a fuller Italian red.",selling:"A fuller Italian red with plum, blackberry, gentle spice and smooth tannins.",hook:"Friendly bold red: dark fruit smooths the spice.",note:"Montepulciano is the grape; Abruzzo is the region. Do not confuse it with the Tuscan town of Montepulciano."}
];

function levelWord(value:number){if(value===0)return"None";if(value<20)return"Very low";if(value<40)return"Low";if(value<60)return"Medium";if(value<80)return"Medium-high";return"High"}

export default function WineAtlas(){
  const [selected,setSelected]=useState(0);
  const wine=wines[selected];
  const structures=useMemo(()=>Object.entries(wine.structure),[wine]);
  return <div className="min-h-screen bg-gray-950 text-gray-100">
    <header className="border-b border-white/10 bg-gray-950/90 sticky top-0 z-20 backdrop-blur">
      <div className="max-w-screen-xl mx-auto px-5 py-4"><h1 className="text-xl font-semibold">Eataly Eight Wines</h1><p className="text-sm text-gray-500">Interactive server study guide</p></div>
    </header>
    <main className="max-w-screen-xl mx-auto px-5 py-6 grid lg:grid-cols-[0.9fr_1.1fr] gap-5">
      <section className="grid sm:grid-cols-2 gap-2 content-start">
        {wines.map((w,i)=><button key={w.name} onClick={()=>setSelected(i)} className={`text-left rounded-xl border p-3 flex gap-3 items-center transition ${selected===i?"border-amber-400 bg-amber-400/10":"border-white/10 bg-gray-900 hover:border-white/30"}`}>
          <span className="w-7 h-7 rounded-full bg-gray-800 grid place-items-center text-xs shrink-0">{i+1}</span>
          <span className="w-8 h-8 rounded-full border border-white/20 shrink-0" style={{backgroundColor:w.color}} />
          <span><span className="block font-medium">{w.name}</span><span className="block text-xs text-gray-500 mt-1">{w.region} · {w.grape}</span></span>
        </button>)}
      </section>

      <section className="bg-gray-900 border border-white/10 rounded-2xl p-5">
        <div className="flex flex-wrap gap-2 items-center text-sm"><span className="px-2 py-1 rounded-full bg-gray-800">{wine.category}</span><span className="text-gray-500">{wine.region}</span></div>
        <h2 className="text-2xl font-semibold mt-3">{wine.name}</h2><p className="text-gray-300 mt-1">{wine.grape}</p>
        <div className="mt-5 grid sm:grid-cols-[150px_1fr] gap-5">
          <div><div className="text-xs uppercase tracking-wide text-gray-500">Wine color</div><div className="h-36 rounded-2xl border border-white/10 mt-2" style={{backgroundColor:wine.color}} /><div className="font-medium text-center mt-2">{wine.colorName}</div></div>
          <div>
            <div className="grid grid-cols-2 gap-3"><div className="rounded-xl border border-white/10 p-3"><div className="text-xs text-gray-500">Body</div><div className="font-medium mt-1">{wine.body}</div></div><div className="rounded-xl border border-white/10 p-3"><div className="text-xs text-gray-500">Style</div><div className="font-medium mt-1">{wine.style}</div></div></div>
            <div className="mt-4 space-y-3">{structures.map(([label,value])=><div key={label}><div className="flex justify-between text-xs"><span>{label}</span><span>{levelWord(value)}</span></div><div className="h-2.5 bg-gray-800 rounded-full overflow-hidden mt-1"><div className="h-full bg-amber-500" style={{width:`${value}%`}} /></div></div>)}</div>
          </div>
        </div>
        <div className="mt-6 grid sm:grid-cols-2 gap-5"><div><h3 className="font-semibold">Aroma — smell</h3><div className="flex flex-wrap gap-2 mt-2">{wine.aroma.map(x=><span key={x} className="px-2 py-1 rounded-full bg-gray-800 text-sm">{x}</span>)}</div></div><div><h3 className="font-semibold">Palate — taste</h3><div className="flex flex-wrap gap-2 mt-2">{wine.taste.map(x=><span key={x} className="px-2 py-1 rounded-full bg-gray-800 text-sm">{x}</span>)}</div></div></div>
        <div className="mt-6 grid sm:grid-cols-2 gap-5"><div><h3 className="font-semibold">Texture</h3><p className="text-gray-300 mt-1">{wine.texture}</p></div><div><h3 className="font-semibold">Finish</h3><p className="text-gray-300 mt-1">{wine.finish}</p></div></div>
        <div className="mt-6 space-y-5"><div><h3 className="font-semibold">Place story</h3><p className="text-gray-300 mt-1">{wine.place}</p></div><div><h3 className="font-semibold">How it is made</h3><p className="text-gray-300 mt-1">{wine.method}</p></div><div><h3 className="font-semibold">Menu pairing</h3><p className="text-gray-300 mt-1">{wine.pairing}</p></div><div><h3 className="font-semibold">Recommend it when the guest says</h3><p className="text-gray-300 mt-1">“{wine.bridge}”</p></div><div className="border border-amber-400/30 bg-amber-400/10 rounded-xl p-4"><div className="text-xs uppercase tracking-wide text-amber-300">15-second selling line</div><p className="font-medium mt-1">{wine.selling}</p></div><div><h3 className="font-semibold">Memory hook</h3><p className="text-gray-300 mt-1">{wine.hook}</p></div>{wine.note&&<div className="border border-white/10 rounded-xl p-4"><div className="font-semibold">Verification note</div><p className="text-sm text-gray-400 mt-1">{wine.note}</p></div>}</div>
      </section>
    </main>
    <div className="max-w-screen-xl mx-auto px-5 pb-8"><div className="rounded-xl border border-amber-400/30 bg-amber-400/10 p-4"><strong>Critical correction:</strong> Champagne request → Ferrari Trento DOC Brut. Pinot Grigio is a still white wine.</div></div>
  </div>
}
