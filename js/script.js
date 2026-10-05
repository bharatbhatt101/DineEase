const MENU=[
{id:'burrata',name:'Burrata & Peppers',description:'Creamy burrata, sweet charred peppers, torn basil',price:16,category:'Starters',image:'assets/dish-burrata.jpg',tag:"Chef's pick"},
{id:'artichoke',name:'Crispy Artichoke',description:'Golden artichoke hearts, chili lemon aioli, mint',price:14,category:'Starters',image:'assets/dish-artichoke.jpg'},
{id:'shortrib',name:'Charcoal Short Rib',description:'12h smoked glaze, bone broth jus, fresh thyme',price:24,category:'Mains',image:'assets/dish-shortrib.jpg',tag:'Popular'},
{id:'cod',name:'Miso Black Cod',description:'48h miso cure, charred scallion, glossy caramel',price:29,category:'Mains',image:'assets/dish-cod.jpg'},
{id:'ramen',name:'Volcano Miso Ramen',description:'Chili-oil broth, chashu pork, jammy egg',price:13.5,category:'Bowls',image:'assets/dish-ramen.jpg',tag:'Spicy'},
{id:'burger',name:'Double Smash Stack',description:'Two patties, aged cheddar, house sauce, brioche',price:11.9,category:'Bowls',image:'assets/dish-burger.jpg'},
{id:'matcha',name:'Matcha Lava Cake',description:'Molten matcha center, sea-salt cream',price:7.2,category:'Desserts',image:'assets/dish-matcha.jpg'},
{id:'tiramisu',name:'Classic Tiramisu',description:'Espresso-soaked layers, mascarpone, cocoa dust',price:8.5,category:'Desserts',image:'assets/dish-tiramisu.jpg'}
];
const CATEGORIES=['All','Starters','Mains','Bowls','Desserts'];
const DELIVERY_FEE=3.5, FREE_DELIVERY_OVER=50;
let cart=read('dineease-cart',[]), favorites=read('dineease-favorites',[]), theme=read('dineease-theme','light');
let search='', category='All', showFavorites=false, checkout=false, placed=false;
const $=s=>document.querySelector(s), $$=s=>document.querySelectorAll(s);
function read(k,f){try{return JSON.parse(localStorage.getItem(k))??f}catch{return f}}
function save(){localStorage.setItem('dineease-cart',JSON.stringify(cart));localStorage.setItem('dineease-favorites',JSON.stringify(favorites));localStorage.setItem('dineease-theme',JSON.stringify(theme));}
function money(n){return '$'+n.toFixed(2)}
function cartCount(){return cart.reduce((n,x)=>n+x.qty,0)}
function subtotal(){return cart.reduce((n,x)=>{const d=MENU.find(d=>d.id===x.id);return n+(d?d.price*x.qty:0)},0)}
function dishQty(id){return cart.find(x=>x.id===id)?.qty||0}
function renderCategories(){ $('#categories').innerHTML=CATEGORIES.map(c=>`<button class="category-btn ${category===c?'active':''}" data-category="${c}">${c}</button>`).join('') }
function renderMenu(){
 const q=search.trim().toLowerCase();
 const dishes=MENU.filter(d=>(!showFavorites||favorites.includes(d.id))&&(category==='All'||d.category===category)&&(!q||`${d.name} ${d.description}`.toLowerCase().includes(q)));
 $('#menuTitle').textContent=showFavorites?'Your favorites':'The menu';
 $('#resultInfo').textContent=`${dishes.length} ${dishes.length===1?'dish':'dishes'}${category!=='All'?' · '+category:''}${search.trim()?' · “'+search.trim()+'”':''}`;
 $('#emptyState').classList.toggle('hidden',dishes.length!==0);
 $('#dishGrid').innerHTML=dishes.map((d,i)=>{const qty=dishQty(d.id),fav=favorites.includes(d.id);return `<article class="dish-card" style="animation-delay:${Math.min(i,8)*60}ms"><div class="dish-image"><img src="${d.image}" alt="${d.name}" loading="lazy">${d.tag?`<span class="tag">${d.tag}</span>`:''}<button class="fav ${fav?'active':''}" data-fav="${d.id}" title="${fav?'Remove from favorites':'Add to favorites'}">${fav?'♥':'♡'}</button></div><div class="dish-info"><div class="dish-top"><div><h3 class="dish-name">${d.name}</h3><p class="dish-desc">${d.description}</p></div><span class="price">${money(d.price)}</span></div>${qty?`<div class="qty-control"><button data-qty="${d.id}" data-delta="-1">−</button><span>${qty} in cart</span><button class="plus" data-qty="${d.id}" data-delta="1">+</button></div>`:`<button class="add-btn" data-add="${d.id}">Add to cart</button>`}</div></article>`}).join('');
}
function renderHeader(){ $('#favoritesCount').textContent=favorites.length;$('#favoritesCount').classList.toggle('hidden',favorites.length===0);$('#favoritesBtn').style.background=showFavorites?'var(--primary)':'';$('#favoritesBtn').style.color=showFavorites?'var(--primary-fg)':'';$('#cartCount').textContent=cartCount();$('#cartCount').classList.toggle('hidden',cartCount()===0);$('#themeBtn').textContent=theme==='dark'?'☀':'☾';document.documentElement.classList.toggle('dark',theme==='dark') }
function renderCart(){
 const body=$('#drawerBody'), sub=subtotal(), delivery=sub>=FREE_DELIVERY_OVER||sub===0?0:DELIVERY_FEE,total=sub+delivery;
 $('#drawerTitle').textContent=placed?'Order placed':checkout?'Checkout':'Your cart';
 if(placed){body.innerHTML=`<div class="success"><div><div class="success-icon">✓</div><h3>Thanks, ${escapeHtml((window.orderName||'Guest').split(' ')[0])}!</h3><p class="small">Your order is on the fire. We'll deliver to <strong>${escapeHtml(window.orderAddress||'your address')}</strong> in about 25 minutes.</p><button class="checkout-btn" id="backMenu">Back to menu</button></div></div>`;return}
 if(!cart.length){body.innerHTML='<div class="empty-cart"><div><div class="empty-icon">🛍</div><h3>Your cart is empty</h3><p class="small">Add something delicious from the menu to get started.</p></div></div>';return}
 if(checkout){body.innerHTML=`<form id="checkoutForm" class="checkout-form"><div><label>Name<input name="name" placeholder="Alex Carter"></label><div class="error" id="nameError"></div></div><div><label>Phone<input name="phone" placeholder="+1 555 010 2030"></label><div class="error" id="phoneError"></div></div><div><label>Delivery address<textarea name="address" rows="3" placeholder="12 Rosewood Lane, Apt 4B"></textarea></label><div class="error" id="addressError"></div></div><div class="cart-summary"><div class="summary-row"><span>Subtotal</span><span>${money(sub)}</span></div><div class="summary-row"><span>Delivery</span><span>${delivery?'$3.50':'Free'}</span></div><div class="summary-row summary-total"><span>Total</span><span>${money(total)}</span></div><button class="checkout-btn">Place order · ${money(total)}</button><button type="button" class="back-btn" id="backCart">Back to cart</button></div></form>`;return}
 const lines=cart.map(x=>({line:x,dish:MENU.find(d=>d.id===x.id)})).filter(x=>x.dish);
 body.innerHTML=`<div class="cart-items">${lines.map(({line,dish})=>`<div class="cart-line"><img src="${dish.image}" alt="${dish.name}"><div class="cart-line-main"><div class="cart-line-title"><h4>${dish.name}</h4><button class="remove" data-remove="${dish.id}">×</button></div><div class="small">${money(dish.price)} each</div><div class="line-bottom"><div class="mini-qty"><button data-cartqty="${dish.id}" data-delta="-1">−</button><span>${line.qty}</span><button data-cartqty="${dish.id}" data-delta="1">+</button></div><strong>${money(dish.price*line.qty)}</strong></div></div></div>`).join('')}</div><div class="cart-summary">${sub<FREE_DELIVERY_OVER?`<div class="notice">Add ${money(FREE_DELIVERY_OVER-sub)} more for free delivery</div>`:''}<div class="summary-row"><span>Subtotal</span><span>${money(sub)}</span></div><div class="summary-row"><span>Delivery</span><span>${delivery?'$3.50':'Free'}</span></div><div class="summary-row summary-total"><span>Total</span><span>${money(total)}</span></div><button class="checkout-btn" id="checkoutBtn">Checkout →</button></div>`;
}
function escapeHtml(s){return s.replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]))}
function openCart(){ $('#overlay').classList.add('open');$('#cartDrawer').classList.add('open');$('#cartDrawer').setAttribute('aria-hidden','false');renderCart() }
function closeCart(){ $('#overlay').classList.remove('open');$('#cartDrawer').classList.remove('open');$('#cartDrawer').setAttribute('aria-hidden','true');setTimeout(()=>{checkout=false;placed=false},300) }
function toast(msg){const t=$('#toast');t.textContent=msg;t.classList.add('show');clearTimeout(window.toastTimer);window.toastTimer=setTimeout(()=>t.classList.remove('show'),1800)}
function add(id){const x=cart.find(x=>x.id===id);if(x)x.qty++;else cart.push({id,qty:1});save();renderAll();toast('Added to cart')}
function setQty(id,qty){if(qty<=0)cart=cart.filter(x=>x.id!==id);else{const x=cart.find(x=>x.id===id);if(x)x.qty=qty}save();renderAll();renderCart()}
function toggleFav(id){favorites=favorites.includes(id)?favorites.filter(x=>x!==id):[...favorites,id];save();renderAll()}
function setSearch(v){search=v;$('#searchInput').value=v;$('#mobileSearchInput').value=v;renderMenu()}
function renderAll(){renderCategories();renderMenu();renderHeader()}

document.addEventListener('click',e=>{
 const cat=e.target.closest('[data-category]');if(cat){category=cat.dataset.category;renderMenu();renderCategories();return}
 const addBtn=e.target.closest('[data-add]');if(addBtn){add(addBtn.dataset.add);return}
 const fav=e.target.closest('[data-fav]');if(fav){toggleFav(fav.dataset.fav);return}
 const qty=e.target.closest('[data-qty]');if(qty){setQty(qty.dataset.qty,dishQty(qty.dataset.qty)+Number(qty.dataset.delta));return}
 const cartQty=e.target.closest('[data-cartqty]');if(cartQty){setQty(cartQty.dataset.cartqty,dishQty(cartQty.dataset.cartqty)+Number(cartQty.dataset.delta));return}
 const remove=e.target.closest('[data-remove]');if(remove){setQty(remove.dataset.remove,0);return}
 if(e.target.id==='checkoutBtn'){checkout=true;renderCart();return}
 if(e.target.id==='backCart'){checkout=false;renderCart();return}
 if(e.target.id==='backMenu'){closeCart();document.querySelector('#menu').scrollIntoView({behavior:'smooth'});return}
});
$('#searchInput').addEventListener('input',e=>setSearch(e.target.value));$('#mobileSearchInput').addEventListener('input',e=>setSearch(e.target.value));
$('#favoritesBtn').addEventListener('click',()=>{showFavorites=!showFavorites;renderAll();document.querySelector('#menu').scrollIntoView({behavior:'smooth'})});
$('#themeBtn').addEventListener('click',()=>{theme=theme==='dark'?'light':'dark';save();renderHeader()});$('#cartBtn').addEventListener('click',openCart);$('#closeCart').addEventListener('click',closeCart);$('#overlay').addEventListener('click',closeCart);
document.addEventListener('submit',e=>{if(e.target.id!=='checkoutForm')return;e.preventDefault();const f=new FormData(e.target),name=String(f.get('name')).trim(),phone=String(f.get('phone')).trim(),address=String(f.get('address')).trim();let ok=true;const set=(id,msg)=>{$('#'+id).textContent=msg;if(msg)ok=false};set('nameError',name.length<2?'Please enter your name':'');set('phoneError',/^[\d\s+()-]{7,15}$/.test(phone)?'':'Enter a valid phone number');set('addressError',address.length<8?'Enter a full delivery address':'');if(!ok)return;window.orderName=name;window.orderAddress=address;placed=true;cart=[];save();renderHeader();renderCart();toast('Order placed successfully')});
renderAll();
