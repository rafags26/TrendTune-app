// app base/* ========= state & seed ========= */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

const store = {
  get: (k, def) => JSON.parse(localStorage.getItem(k) || JSON.stringify(def)),
  set: (k, v) => localStorage.setItem(k, JSON.stringify(v)),
};

const seedExplore = [
  { id: "e1", tag: "music", title: "Neon Beats", img: "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=1200&auto=format&fit=crop" },
  { id: "e2", tag: "fashion", title: "Glow Outfit", img: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1200&auto=format&fit=crop" },
  { id: "e3", tag: "tech", title: "AI Vibes", img: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&auto=format&fit=crop" },
  { id: "e4", tag: "lifestyle", title: "City Lights", img: "https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=1200&auto=format&fit=crop" },
  { id: "e5", tag: "music", title: "Stage Energy", img: "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=1200&auto=format&fit=crop" },
  { id: "e6", tag: "fashion", title: "Bold Colors", img: "https://images.unsplash.com/photo-1445205170230-053b83016050?w=1200&auto=format&fit=crop" }
];

const defaultUser = {
  name: "Você",
  handle: "@trenduser",
  bio: "Criador(a) na TrendTune ✨ neon vibes • música • moda • tech",
  avatar: "",
  followers: 12,
  following: 34
};

const initial = {
  user: store.get("tt_user", defaultUser),
  posts: store.get("tt_posts", [
    {
      id: crypto.randomUUID(),
      author: { name: "TrendTune", handle: "@trendtune", avatar: "" },
      text: "Bem-vindx à demo neon! Publique algo, curta, comente, explore e edite seu perfil. 💫",
      img: "",
      likes: 4,
      comments: []
    }
  ]),
  notifs: store.get("tt_notifs", [
    { id: crypto.randomUUID(), txt: "Seu perfil recebeu 3 novas visualizações hoje." },
    { id: crypto.randomUUID(), txt: "Nova sugestão em #Música: 'Neon Beats'." }
  ]),
  explore: store.get("tt_explore", seedExplore),
  followed: store.get("tt_followed", []),
  theme: store.get("tt_theme", "dark")
};

let state = initial;

/* ========= helpers ========= */
function save(){
  store.set("tt_user", state.user);
  store.set("tt_posts", state.posts);
  store.set("tt_notifs", state.notifs);
  store.set("tt_explore", state.explore);
  store.set("tt_followed", state.followed);
  store.set("tt_theme", state.theme);
  render();
}

function toast(msg){
  const wrap = $("#toasts");
  const t = document.createElement("div");
  t.className = "toast";
  t.textContent = msg;
  wrap.appendChild(t);
  setTimeout(() => t.remove(), 2800);
}
const formatHandle = s => s.startsWith("@") ? s : "@"+s;

/* ========= render ========= */
function render(){
  // theme
  document.body.classList.toggle("light", state.theme === "light");

  // avatars & composer - força reload sem cache
  const avatarUrl = state.user.avatar || "https://i.pravatar.cc/120?img=66";
  const composerAvatar = $("#composerAvatar");
  const profileAvatar = $("#profileAvatar");
  
  // Força reload removendo e adicionando novamente
  if(composerAvatar) {
    composerAvatar.src = "";
    composerAvatar.src = avatarUrl;
  }
  if(profileAvatar) {
    profileAvatar.src = "";
    profileAvatar.src = avatarUrl;
  }

  $("#composerName").textContent = state.user.name;
  $("#profileName").textContent = state.user.name;
  $("#profileHandle").textContent = state.user.handle;
  $("#profileBio").textContent = state.user.bio;
  $("#statFollowers").textContent = state.user.followers;
  $("#statFollowing").textContent = state.user.following;

  // posts
  $("#statPosts").textContent = state.posts.length;
  const feed = $("#feedList");
  const prof = $("#profilePosts");
  feed.innerHTML = "";
  prof.innerHTML = "";

  if(!state.posts.length){
    feed.innerHTML = `<div class="card feed-empty">Nenhum post ainda. Publique algo! ✨</div>`;
  }

  state.posts.slice().reverse().forEach(p => {
    const feedCard = postCard(p);
    feed.appendChild(feedCard);
    const profCard = postCard(p);
    prof.appendChild(profCard);
  });

  // explore
  const grid = $("#exploreGrid");
  grid.innerHTML = "";
  state.explore.forEach(item => {
    const card = document.createElement("div");
    card.className = "card";
    const isFollowed = state.followed.includes(item.id);
    card.innerHTML = `
      <img src="${item.img}" alt="${item.title}" style="width:100%; border-radius:12px; aspect-ratio: 4/3; object-fit:cover;">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-top:8px;">
        <div>
          <strong>${item.title}</strong>
          <div class="muted">#${item.tag}</div>
        </div>
        <button class="btn follow-btn ${isFollowed ? 'active' : ''}" data-id="${item.id}">
          ${isFollowed ? 'Seguindo' : 'Seguir'}
        </button>
      </div>
    `;
    grid.appendChild(card);
  });

  // notifications
  const nl = $("#notifList");
  nl.innerHTML = "";
  state.notifs.slice().reverse().forEach(n => {
    const it = document.createElement("div");
    it.className = "card";
    it.textContent = n.txt;
    nl.appendChild(it);
  });
}

function postCard(p){
  const card = document.createElement("article");
  card.className = "card post";
  card.dataset.id = p.id;
  
  // Se o post é do usuário atual, usa informações atualizadas
  const isCurrentUser = p.author.handle === state.user.handle;
  const displayName = isCurrentUser ? state.user.name : p.author.name;
  const displayHandle = isCurrentUser ? state.user.handle : p.author.handle;
  const displayAvatar = isCurrentUser ? (state.user.avatar || 'https://i.pravatar.cc/100?img=66') : (p.author.avatar || 'https://i.pravatar.cc/100?img=12');
  
  // Create comments HTML
  const commentsHtml = p.comments.map(c => `
    <div class="comment" style="padding: 8px 0; border-bottom: 1px solid rgba(255,255,255,.03); color: var(--muted); font-size: .9rem;">
      <strong style="color: var(--text);">@usuario</strong> ${escapeHtml(c.text)}
    </div>
  `).join('');
  
  card.innerHTML = `
    <div class="post-head">
      <img class="avatar" src="${displayAvatar}" alt="${displayName}">
      <div class="post-meta">
        <strong>${displayName}</strong>
        <small>${displayHandle}</small>
      </div>
    </div>
    <div class="post-text">${escapeHtml(p.text).replace(/\n/g,'<br/>')}</div>
    ${p.img ? `<div class="media"><img src="${p.img}" alt="Imagem do post"></div>` : ""}
    <div class="post-actions">
      <button class="btn like-btn">❤ Curtir <span class="counter">${p.likes}</span></button>
      <button class="btn comment-toggle">💬 Comentar <span class="counter">${p.comments.length}</span></button>
      <button class="btn share-btn">🔗 Compartilhar</button>
    </div>
    <div class="comment-box">
      <input type="text" placeholder="Escreva um comentário e pressione Enter" />
    </div>
    ${p.comments.length > 0 ? `<div class="comments-list">${commentsHtml}</div>` : ""}
  `;

  // events
  $(".like-btn", card).addEventListener("click", () => {
    const idx = state.posts.findIndex(x => x.id === p.id);
    state.posts[idx].likes++;
    toast("Post curtido 💜");
    save();
  });

  $(".comment-toggle", card).addEventListener("click", () => {
    $(".comment-box", card).classList.toggle("show");
  });

  $(".comment-box input", card).addEventListener("keydown", (e) => {
    if(e.key === "Enter" && e.target.value.trim()){
      const idx = state.posts.findIndex(x => x.id === p.id);
      state.posts[idx].comments.push({ id: crypto.randomUUID(), text: e.target.value.trim() });
      e.target.value = "";
      toast("Comentário publicado 💬");
      save();
    }
  });

  $(".share-btn", card).addEventListener("click", async () => {
    const text = `${p.author.name} em TrendTune: ${p.text.slice(0,80)}...`;
    try{
      await navigator.clipboard.writeText(text);
      toast("Link copiado para a área de transferência 🔗");
    }catch{
      toast("Não foi possível copiar 😅");
    }
  });

  return card;
}

function escapeHtml(str){
  return str.replace(/[&<>"']/g, (m) => ({
    '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'
  }[m]));
}

/* ========= actions & handlers ========= */
// tabs
$$(".tab-btn").forEach(btn=>{
  btn.addEventListener("click", () => {
    $$(".tab-btn").forEach(b=>b.classList.remove("active"));
    btn.classList.add("active");
    const tab = btn.dataset.tab;
    $$(".tab").forEach(t => t.classList.remove("active"));
    $("#"+tab).classList.add("active");
    
    // Scroll suave para o topo do container
    const container = $(".container");
    if(container) {
      container.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    
    // Feedback visual com toast
    const tabNames = {
      feed: '📱 Feed',
      explore: '🔍 Explorar',
      notifications: '🔔 Notificações',
      profile: '👤 Perfil'
    };
    toast(`Navegando para ${tabNames[tab] || tab}`);
  });
});

// theme
$("#themeToggle").addEventListener("click", ()=>{
  state.theme = state.theme === "dark" ? "light" : "dark";
  save();
});

// about
$("#aboutBtn").addEventListener("click", ()=> $("#aboutModal").showModal());

// composer
const imgInput = $("#postImage");
imgInput.addEventListener("change", (e)=>{
  const file = e.target.files[0];
  if(!file) return $("#imagePreview").classList.add("hidden");
  const url = URL.createObjectURL(file);
  $("#imagePreview").innerHTML = `<img src="${url}" alt="Prévia da imagem selecionada">`;
  $("#imagePreview").classList.remove("hidden");
});

$("#publishBtn").addEventListener("click", ()=>{
  const text = $("#postText").value.trim();
  const file = imgInput.files[0];
  if(!text && !file){ toast("Escreva algo ou adicione uma imagem ✨"); return; }

  const newPost = {
    id: crypto.randomUUID(),
    author: { name: state.user.name, handle: state.user.handle, avatar: state.user.avatar },
    text,
    img: "",
    likes: 0,
    comments: []
  };

  if(file){
    const reader = new FileReader();
    reader.onload = () => {
      newPost.img = reader.result;
      state.posts.push(newPost);
      $("#postText").value = "";
      imgInput.value = "";
      $("#imagePreview").classList.add("hidden");
      state.notifs.push({ id: crypto.randomUUID(), txt: "Você publicou um novo post." });
      toast("Post publicado 🚀");
      save();
    };
    reader.readAsDataURL(file);
  }else{
    state.posts.push(newPost);
    $("#postText").value = "";
    state.notifs.push({ id: crypto.randomUUID(), txt: "Você publicou um novo post." });
    toast("Post publicado 🚀");
    save();
  }
});

// explore: search + filters + follow
$("#searchInput").addEventListener("input", (e)=>{
  const term = e.target.value.toLowerCase();
  state.explore = store.get("tt_explore", seedExplore).filter(i =>
    i.title.toLowerCase().includes(term) || i.tag.toLowerCase().includes(term)
  );
  render();
});
$$(".chip").forEach(c=>{
  c.addEventListener("click", ()=>{
    $$(".chip").forEach(chip => chip.classList.remove("active"));
    c.classList.add("active");
    const tag = c.dataset.filter;
    if(tag === "all"){ state.explore = store.get("tt_explore", seedExplore); }
    else { state.explore = store.get("tt_explore", seedExplore).filter(i=>i.tag===tag); }
    $("#searchInput").value = "";
    toast(`Filtrando por ${c.textContent} ✨`);
    render();
  });
});

document.addEventListener("click", (e)=>{
  if(e.target.matches(".follow-btn")){
    const itemId = e.target.dataset.id;
    if(!state.followed.includes(itemId)){
      state.followed.push(itemId);
      state.user.following += 1;
      state.notifs.push({ id: crypto.randomUUID(), txt: "Você começou a seguir uma nova conta." });
      toast("Seguindo ✓");
      save();
    }
  }
});

// profile: avatar + bio
const avatarInput = $("#avatarInput");
if(avatarInput) {
  avatarInput.addEventListener("change", (e)=>{
    const file = e.target.files[0];
    if(!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      state.user.avatar = reader.result;
      
      // Atualiza imediatamente todas as imagens de avatar
      const avatarUrl = state.user.avatar;
      $("#composerAvatar").src = avatarUrl;
      $("#profileAvatar").src = avatarUrl;
      
      toast("Foto atualizada 📸");
      save();
    };
    reader.readAsDataURL(file);
  });
}

const editBioBtn = $("#editBioBtn");
if(editBioBtn) {
  editBioBtn.addEventListener("click", async ()=>{
    const bio = prompt("Escreva sua nova bio:", state.user.bio);
    if(bio !== null){
      state.user.bio = bio.trim().slice(0, 180);
      toast("Bio atualizada ✍️");
      save();
    }
  });
}

const resetAvatarBtn = $("#resetAvatarBtn");
if(resetAvatarBtn) {
  resetAvatarBtn.addEventListener("click", ()=>{
    if(confirm("Tem certeza que deseja remover sua foto de perfil?")){
      state.user.avatar = "";
      
      // Limpa as imagens imediatamente
      const defaultAvatar = "https://i.pravatar.cc/120?img=66";
      $("#composerAvatar").src = defaultAvatar;
      $("#profileAvatar").src = defaultAvatar;
      
      toast("Foto resetada! Agora você pode adicionar uma nova 🔄");
      save();
    }
  });
}

/* ========= init ========= */
(function init(){
  // set theme
  if(state.theme === "light") document.body.classList.add("light");
  // basic meta
  $("#profileAvatar").src = state.user.avatar || "https://i.pravatar.cc/120?img=66";
  
  // Força atualização das imagens do explore se necessário
  const storedExplore = store.get("tt_explore", []);
  if(storedExplore.length === 0 || storedExplore[0].img.includes("q=80")) {
    state.explore = seedExplore;
    store.set("tt_explore", seedExplore);
  }
  
  // set first chip as active
  const firstChip = $(".chip[data-filter='all']");
  if(firstChip) firstChip.classList.add("active");
  render();
})();
