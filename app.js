// app.js — page interaction for Rooms & Facilities
// This was moved from the inline script in index.html

// Sample data: 18 bodim + 4 business = 22 rooms
const rooms = (() => {
  const arr = [];
  for (let i = 1; i <= 18; i++){
    arr.push({
      id: 'B' + i,
      name: 'Bodim ' + i,
      type: 'bodim',
      capacity: 1 + (i % 3), // 1-3 capacity pattern
      price: 50 + (i % 5) * 10,
      facilities: ['Water','Electricity','Toilet'].concat(i % 4 === 0 ? ['Kitchen access'] : []),
      available: (i % 4) !== 0, // some not available
      image: '', // optional: set real URLs
    });
  }
  for (let j = 1; j <= 4; j++){
    arr.push({
      id: 'BX' + j,
      name: 'Business ' + j,
      type: 'business',
      capacity: 2 + j,
      price: 120 + j * 40,
      facilities: ['Water','Electricity','Toilet','Parking','Wifi'],
      available: j !== 2,
      image: ''
    });
  }
  return arr;
})();

// Elements
const roomsGrid = document.getElementById('roomsGrid');
const totalRooms = document.getElementById('totalRooms');
const availableRooms = document.getElementById('availableRooms');
const businessRooms = document.getElementById('businessRooms');
const availCount = document.getElementById('availCount');
const searchInput = document.getElementById('search');
const typeFilter = document.getElementById('typeFilter');
const showAvailableBtn = document.getElementById('showAvailableBtn');
const clearBtn = document.getElementById('clearBtn');
const contactBtn = document.getElementById('contactBtn');
const modal = document.getElementById('modal');
const cancelModal = document.getElementById('cancelModal');
const submitModal = document.getElementById('submitModal');
const emptyMsg = document.getElementById('emptyMsg');
const contactFormFields = {
  name: document.getElementById('rName'),
  phone: document.getElementById('rPhone'),
  email: document.getElementById('rEmail'),
  room: document.getElementById('rRoom'),
  message: document.getElementById('rMessage')
};

// Initial stats
function updateStats(){
  totalRooms.textContent = rooms.length;
  availableRooms.textContent = rooms.filter(r => r.available).length;
  businessRooms.textContent = rooms.filter(r => r.type === 'business').length;
  availCount.textContent = rooms.filter(r => r.available).length;
}

function createCard(r){
  const card = document.createElement('article');
  card.className = 'card';
  const thumb = document.createElement('div');
  thumb.className = 'thumb';
  if (r.image){
    thumb.style.backgroundImage = `url(${r.image})`;
  } else {
    // simple gradient placeholder
    thumb.style.background = `linear-gradient(135deg, #e6f6f5, #f6fafb)`;
    thumb.style.display = 'flex';
    thumb.style.alignItems = 'center';
    thumb.style.justifyContent = 'center';
    thumb.style.fontWeight = '700';
    thumb.style.color = '#0f172a';
    thumb.textContent = r.type === 'business' ? 'Business' : 'Bodim';
  }

  const cb = document.createElement('div');
  cb.className = 'card-body';
  const title = document.createElement('div');
  title.className = 'title';
  title.textContent = r.name + ' • ' + r.id;
  const meta = document.createElement('div');
  meta.className = 'meta';
  meta.innerHTML = `<div>${r.capacity} pax • $${r.price}/mo</div><div class="${r.available ? 'available' : 'unavailable'}">${r.available ? 'Available' : 'Occupied'}</div>`;

  const facilities = document.createElement('div');
  facilities.className = 'facilities';
  r.facilities.slice(0,5).forEach(f => {
    const t = document.createElement('div');
    t.className = 'tag';
    t.textContent = f;
    facilities.appendChild(t);
  });

  const actions = document.createElement('div');
  actions.style.marginTop = 'auto';
  actions.style.display = 'flex';
  actions.style.gap = '8px';
  const detailsBtn = document.createElement('button');
  detailsBtn.className = 'btn ghost';
  detailsBtn.textContent = 'Details';
  detailsBtn.onclick = () => {
    alert(`${r.name} — Facilities: ${r.facilities.join(', ')}\nPrice: $${r.price}/mo\nCapacity: ${r.capacity}\nStatus: ${r.available ? 'Available' : 'Occupied'}`);
  };
  const reserveBtn = document.createElement('button');
  reserveBtn.className = 'btn';
  reserveBtn.textContent = 'Reserve';
  reserveBtn.onclick = () => {
    openModalWithRoom(r);
  };
  actions.appendChild(detailsBtn);
  actions.appendChild(reserveBtn);

  cb.appendChild(title);
  cb.appendChild(meta);
  cb.appendChild(facilities);
  cb.appendChild(actions);

  card.appendChild(thumb);
  card.appendChild(cb);
  return card;
}

function renderList(list){
  roomsGrid.innerHTML = '';
  if (!list.length){
    emptyMsg.style.display = 'block';
  } else {
    emptyMsg.style.display = 'none';
    const frag = document.createDocumentFragment();
    list.forEach(r => frag.appendChild(createCard(r)));
    roomsGrid.appendChild(frag);
  }
}

function filterAndRender(){
  const q = searchInput.value.trim().toLowerCase();
  const type = typeFilter.value;
  let out = rooms.slice();

  if (type === 'bodim') out = out.filter(r => r.type === 'bodim');
  if (type === 'business') out = out.filter(r => r.type === 'business');
  if (type === 'available') out = out.filter(r => r.available);

  if (q){
    out = out.filter(r => {
      return r.name.toLowerCase().includes(q)
        || r.id.toLowerCase().includes(q)
        || r.facilities.join(' ').toLowerCase().includes(q)
        || String(r.capacity).includes(q);
    });
  }

  // update available count for current list
  availCount.textContent = out.filter(r => r.available).length;
  renderList(out);
}

// modal helpers
function openModalWithRoom(r){
  modal.style.display = 'flex';
  contactFormFields.room.value = `${r.name} (${r.id})`;
  contactFormFields.message.focus();
  document.body.style.overflow = 'hidden';
}
function closeModal(){
  modal.style.display = 'none';
  document.body.style.overflow = '';
  // clear fields
  Object.values(contactFormFields).forEach(el => el.value = '');
}

// event wiring
searchInput.addEventListener('input', () => filterAndRender());
typeFilter.addEventListener('change', () => filterAndRender());
showAvailableBtn.addEventListener('click', () => {
  typeFilter.value = 'available';
  filterAndRender();
  window.scrollTo({top: 200, behavior:'smooth'});
});
clearBtn.addEventListener('click', () => {
  searchInput.value = '';
  typeFilter.value = 'all';
  filterAndRender();
});
contactBtn.addEventListener('click', () => {
  modal.style.display = 'flex';
  document.body.style.overflow = 'hidden';
});
cancelModal.addEventListener('click', closeModal);
modal.addEventListener('click', (e) => {
  if (e.target === modal) closeModal();
});

submitModal.addEventListener('click', () => {
  // Basic client-side validation
  const name = contactFormFields.name.value.trim();
  const phone = contactFormFields.phone.value.trim();
  const email = contactFormFields.email.value.trim();
  const message = contactFormFields.message.value.trim();
  if (!name || (!phone && !email)){
    alert('Please provide your name and at least a phone or email so we can contact you.');
    return;
  }
  // For production: send to your server via fetch() or integrate with email service
  console.log('Reservation request', {
    name, phone, email, room: contactFormFields.room.value, message
  });
  alert('Thank you! Your request has been sent. We will contact you soon to confirm.');
  closeModal();
});

// initial render
updateStats();
filterAndRender();
