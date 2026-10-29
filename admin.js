// Admin login - password GAS me verify hota hai, frontend pe nahi
let isAdmin = false;

async function adminLogin(){
  const user = document.getElementById('adminUser').value.trim();
  const pass = document.getElementById('adminPass').value.trim();
  const err = document.getElementById('loginError');
  err.classList.add('hidden');

  if(!user || !pass){ err.innerText="ID Pass required"; err.classList.remove('hidden'); return; }

  // If GAS not set, allow demo login
  if(CONFIG.GAS_URL.includes("YOUR_SCRIPT_ID")){
    if(user==="admin" && pass==="royal123"){
      showPanel();
    }else{
      err.innerText="Demo login: admin / royal123"; err.classList.remove('hidden');
    }
    return;
  }

  try{
    const res = await fetch(CONFIG.GAS_URL, {method:"POST", body: JSON.stringify({action:"adminLogin", username:user, password:pass})});
    const data = await res.json();
    if(data.success){ showPanel(); }
    else { err.innerText = data.error||"Login failed"; err.classList.remove('hidden'); }
  }catch(e){ err.innerText = e.message; err.classList.remove('hidden'); }
}

function showPanel(){
  document.getElementById('loginBox').classList.add('hidden');
  document.getElementById('adminPanel').classList.remove('hidden');
  isAdmin = true;
  localStorage.setItem('royal_admin','1');
}
function logout(){ localStorage.removeItem('royal_admin'); location.reload(); }

// Auto login check
if(localStorage.getItem('royal_admin')==='1' && CONFIG.GAS_URL.includes("YOUR_SCRIPT_ID")){
  showPanel();
}

// Post product
document.getElementById('productForm')?.addEventListener('submit', async (e)=>{
  e.preventDefault();
  const status = document.getElementById('postStatus');

  const original = parseFloat(document.getElementById('pOriginal').value);
  const selling = parseFloat(document.getElementById('pSelling').value);

  if(isNaN(original) || isNaN(selling)){ status.innerText="Price number me likho"; return; }
  if(selling >= original){ status.innerText="Selling must be < Original (bug fixed)"; status.className="text-xs text-red-400 text-center"; return; }

  const photosRaw = document.getElementById('pPhotos').value.trim();
  const photos = photosRaw ? photosRaw.split(',').map(s=>s.trim()).filter(Boolean) : [];

  const payload = {
    action: "addProduct",
    id: crypto.randomUUID(), // fixed: Date.now() bug hataya
    title: document.getElementById('pTitle').value.trim(),
    category: document.getElementById('pCategory').value.trim(),
    description: document.getElementById('pDesc').value.trim(),
    originalPrice: original,
    sellingPrice: selling,
    driveLink: document.getElementById('pDrive').value.trim(),
    isPaid: document.getElementById('pIsPaid').value,
    upiId: document.getElementById('pUpi').value.trim(),
    photos: photos,
    whatInside: document.getElementById('pInside').value.trim(),
    licenseType: document.getElementById('pLicense').value.trim(),
    date: new Date().toISOString(),
    views:0, likes:0
  };

  if(!payload.title || !payload.driveLink){ status.innerText="Title & Drive Link required"; return; }
  if(payload.isPaid==="TRUE" && !payload.upiId){ status.innerText="UPI ID required if Paid"; return; }

  status.innerText="Publishing to Google Sheet...";
  status.className="text-xs text-yellow-500 text-center";

  try{
    if(CONFIG.GAS_URL.includes("YOUR_SCRIPT_ID")){
      status.innerText="Demo: GAS_URL set nahi hai, isliye Sheet me save nahi hua. README dekho.";
      status.className="text-xs text-green-400 text-center";
      return;
    }
    const res = await fetch(CONFIG.GAS_URL, {method:"POST", body: JSON.stringify(payload)});
    const data = await res.json();
    if(data.success){
      status.innerText="✓ Product PRODUCTS sheet me save ho gaya!";
      status.className="text-xs text-green-400 text-center";
      e.target.reset();
    }else{
      status.innerText="Error: "+data.error;
      status.className="text-xs text-red-400 text-center";
    }
  }catch(err){
    status.innerText="Error: "+err.message;
    status.className="text-xs text-red-400 text-center";
  }
});
