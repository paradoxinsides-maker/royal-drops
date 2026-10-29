let allProducts = [];

async function loadProducts(){
  const loader = document.getElementById('loader');
  const grid = document.getElementById('productsGrid');
  const empty = document.getElementById('emptyState');
  const count = document.getElementById('productCount');

  if(CONFIG.GAS_URL.includes("YOUR_SCRIPT_ID")){
    loader.innerHTML = `GAS_URL set nahi hai. README padho. Demo data dikh raha hai.`;
    // Demo fallback
    allProducts = [
      {id:"1", title:"Royal Gold Ghost Wrap", category:"Rolls Royce", description:"Luxury sedan gold wrapped edition", originalPrice:999, sellingPrice:299, driveLink:"https://drive.google.com", photos:["https://picsum.photos/600/400?1"], isPaid:"TRUE", upiId:"demo@upi", whatInside:"PSD + JPG", licenseType:"Personal"},
      {id:"2", title:"Midnight Black Phantom", category:"Rolls Royce", description:"Original black edition", originalPrice:799, sellingPrice:0, driveLink:"https://drive.google.com", photos:["https://picsum.photos/600/400?2"], isPaid:"FALSE", upiId:"", whatInside:"JPG Pack", licenseType:"Personal"}
    ];
    renderProducts(allProducts);
    loader.classList.add('hidden');
    return;
  }

  try{
    const res = await fetch(CONFIG.GAS_URL + "?action=getProducts");
    const data = await res.json();
    allProducts = data.products || [];
    renderProducts(allProducts);
  }catch(e){
    loader.innerText = "Sheet load fail: " + e.message;
    return;
  }
  loader.classList.add('hidden');
}

function renderProducts(list){
  const grid = document.getElementById('productsGrid');
  const empty = document.getElementById('emptyState');
  const count = document.getElementById('productCount');
  grid.innerHTML = "";
  count.innerText = list.length + " Designs";
  if(list.length===0){ empty.classList.remove('hidden'); grid.classList.add('hidden'); return;}
  empty.classList.add('hidden');
  grid.classList.remove('hidden');
  list.forEach(p=>{
    const isPaid = (p.isPaid===true || p.isPaid==="TRUE");
    const el = document.createElement('div');
    el.className = "card bg-zinc-900 border border-white border-opacity-10 rounded-2xl overflow-hidden transition-all";
    el.innerHTML = `
      <div class="h-48 bg-zinc-800 bg-cover bg-center" style="background-image:url('${(p.photos&&p.photos[0])||''}')"></div>
      <div class="p-4">
        <div class="flex justify-between items-start">
          <h3 class="font-bold">${p.title}</h3>
          <span class="text-[10px] px-2 py-1 rounded-full bg-yellow-500 bg-opacity-20 text-yellow-500">${p.category||'Rolls Royce'}</span>
        </div>
        <p class="text-xs opacity-60 mt-1 truncate-2">${p.description||''}</p>
        <div class="mt-3 flex items-center gap-2">
          <span class="text-xs line-through opacity-40">₹${p.originalPrice||999}</span>
          <span class="font-bold text-yellow-500">₹${p.sellingPrice||299}</span>
          <span class="ml-auto text-[10px] px-2 py-1 rounded-full ${isPaid?'bg-red-500 bg-opacity-20 text-red-400':'bg-green-500 bg-opacity-20 text-green-400'}">${isPaid?'Paid':'Free'}</span>
        </div>
        <button onclick="openModal('${p.id}')" class="mt-4 w-full h-10 rounded-full bg-white text-black font-bold text-sm hover:bg-yellow-500">Download Now</button>
      </div>
    `;
    grid.appendChild(el);
  });
}

function openModal(id){
  const p = allProducts.find(x=>x.id==id);
  if(!p) return;
  document.getElementById('vProductTitle').value = p.title;
  document.getElementById('vProductCategory').value = p.category;
  document.getElementById('vIsPaid').value = p.isPaid;
  document.getElementById('modalTitle').innerText = p.title;
  document.getElementById('modalType').innerText = (p.isPaid==="TRUE"||p.isPaid===true)?"Paid Download - ₹"+p.sellingPrice:"Free Download";
  document.getElementById('downloadModal').classList.remove('hidden');
}
function closeModal(){ document.getElementById('downloadModal').classList.add('hidden'); }

document.getElementById('visitorForm')?.addEventListener('submit', async (e)=>{
  e.preventDefault();
  const payload = {
    action: (document.getElementById('vIsPaid').value==="TRUE"||document.getElementById('vIsPaid').value===true||document.getElementById('vIsPaid').value==="true") ? "paidDownload" : "freeDownload",
    name: document.getElementById('vName').value.trim(),
    email: document.getElementById('vEmail').value.trim(),
    whatsapp: document.getElementById('vWhatsapp').value.trim(),
    designTitle: document.getElementById('vProductTitle').value,
    category: document.getElementById('vProductCategory').value,
    date: new Date().toISOString()
  };
  // Validation
  if(!payload.name || !payload.email || !payload.whatsapp){ alert("All fields required"); return; }

  try{
    if(CONFIG.GAS_URL.includes("YOUR_SCRIPT_ID")){
      alert("Demo mode: Data Google Sheet me nahi gaya. GAS_URL set karo.\nDrive Link: "+ allProducts.find(x=>x.title==payload.designTitle)?.driveLink);
      closeModal();
      return;
    }
    const res = await fetch(CONFIG.GAS_URL, {method:"POST", body: JSON.stringify(payload)});
    const data = await res.json();
    const prod = allProducts.find(x=>x.title==payload.designTitle);
    if(data.success){
      alert("Saved to Sheet: "+payload.action+"\nAb Drive pe le ja rahe hain");
      window.open(prod.driveLink, "_blank");
      closeModal();
    }else alert("Error: "+data.error);
  }catch(err){ alert("Error: "+err.message); }
});

document.getElementById('searchInput')?.addEventListener('input', (e)=>{
  const q = e.target.value.toLowerCase();
  const filtered = allProducts.filter(p=> p.title.toLowerCase().includes(q) || (p.category||'').toLowerCase().includes(q) || (p.description||'').toLowerCase().includes(q));
  renderProducts(filtered);
});

loadProducts();
