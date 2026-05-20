from django.http import HttpResponse


def api_explorer(request):
    html = """<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>API Explorer — Saveur</title>
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  :root{
    --red:#e53e3e;--red-dark:#c53030;--red-light:#fff5f5;
    --gray-50:#f9fafb;--gray-100:#f3f4f6;--gray-200:#e5e7eb;
    --gray-400:#9ca3af;--gray-600:#4b5563;--gray-800:#1f2937;
    --green:#16a34a;--blue:#2563eb;--orange:#d97706;
    --radius:8px;--shadow:0 1px 4px rgba(0,0,0,.12);
  }
  body{font-family:'Segoe UI',system-ui,sans-serif;background:var(--gray-50);color:var(--gray-800);display:flex;min-height:100vh}

  /* SIDEBAR */
  #sidebar{width:260px;min-width:260px;background:#fff;border-right:1px solid var(--gray-200);display:flex;flex-direction:column;position:sticky;top:0;height:100vh;overflow-y:auto}
  #sidebar-header{padding:20px 16px 12px;border-bottom:1px solid var(--gray-200)}
  #sidebar-header h1{font-size:1.1rem;font-weight:700;color:var(--red)}
  #sidebar-header p{font-size:.75rem;color:var(--gray-400);margin-top:2px}
  .nav-section{padding:8px 0}
  .nav-section-title{font-size:.7rem;font-weight:600;color:var(--gray-400);text-transform:uppercase;letter-spacing:.08em;padding:6px 16px}
  .nav-item{display:block;padding:7px 16px;font-size:.85rem;color:var(--gray-600);cursor:pointer;border-left:3px solid transparent;transition:all .15s}
  .nav-item:hover{background:var(--gray-50);color:var(--gray-800)}
  .nav-item.active{border-left-color:var(--red);background:var(--red-light);color:var(--red);font-weight:600}

  /* MAIN */
  #main{flex:1;padding:24px;max-width:900px}
  .section{display:none}
  .section.active{display:block}
  .section-title{font-size:1.4rem;font-weight:700;margin-bottom:4px}
  .section-desc{font-size:.85rem;color:var(--gray-600);margin-bottom:20px}

  /* TOKEN BAR */
  #token-bar{background:#fff;border:1px solid var(--gray-200);border-radius:var(--radius);padding:12px 16px;margin-bottom:24px;display:flex;align-items:center;gap:10px;flex-wrap:wrap}
  #token-bar label{font-size:.8rem;font-weight:600;color:var(--gray-600);white-space:nowrap}
  #token-input{flex:1;min-width:200px;font-size:.8rem;padding:6px 10px;border:1px solid var(--gray-200);border-radius:6px;font-family:monospace}
  #token-status{font-size:.75rem;padding:4px 10px;border-radius:20px;background:var(--gray-100);color:var(--gray-600)}
  #token-status.set{background:#dcfce7;color:var(--green)}
  #clear-token{font-size:.75rem;padding:5px 10px;border:1px solid var(--gray-200);background:#fff;border-radius:6px;cursor:pointer}

  /* CARDS */
  .card{background:#fff;border:1px solid var(--gray-200);border-radius:var(--radius);margin-bottom:16px;overflow:hidden;box-shadow:var(--shadow)}
  .card-header{padding:14px 16px;display:flex;align-items:center;gap:10px;cursor:pointer;user-select:none;border-bottom:1px solid transparent;transition:background .15s}
  .card-header:hover{background:var(--gray-50)}
  .card-header.open{border-bottom-color:var(--gray-200)}
  .method-badge{font-size:.7rem;font-weight:700;padding:3px 8px;border-radius:4px;min-width:58px;text-align:center;letter-spacing:.04em}
  .method-badge.GET{background:#dbeafe;color:#1d4ed8}
  .method-badge.POST{background:#dcfce7;color:#15803d}
  .method-badge.PUT,.method-badge.PATCH{background:#fef9c3;color:#854d0e}
  .method-badge.DELETE{background:#fee2e2;color:#dc2626}
  .card-title{font-size:.9rem;font-weight:600;flex:1}
  .card-url{font-size:.75rem;color:var(--gray-400);font-family:monospace}
  .card-arrow{color:var(--gray-400);transition:transform .2s;font-size:.8rem}
  .card-body{display:none;padding:16px}
  .card-body.open{display:block}

  /* FORM */
  .form-row{display:flex;flex-direction:column;gap:4px;margin-bottom:12px}
  .form-row label{font-size:.8rem;font-weight:600;color:var(--gray-600)}
  .form-row input,.form-row select,.form-row textarea{padding:8px 10px;border:1px solid var(--gray-200);border-radius:6px;font-size:.85rem;font-family:inherit;transition:border-color .15s}
  .form-row input:focus,.form-row select:focus,.form-row textarea:focus{outline:none;border-color:var(--red)}
  .form-row textarea{resize:vertical;min-height:80px}
  .form-hint{font-size:.72rem;color:var(--gray-400);margin-top:2px}
  .form-grid{display:grid;grid-template-columns:1fr 1fr;gap:0 14px}
  @media(max-width:600px){.form-grid{grid-template-columns:1fr}}
  .btn{padding:9px 20px;border:none;border-radius:6px;font-size:.85rem;font-weight:600;cursor:pointer;transition:background .15s}
  .btn-primary{background:var(--red);color:#fff}
  .btn-primary:hover{background:var(--red-dark)}
  .btn-primary:disabled{background:var(--gray-400);cursor:not-allowed}
  .btn-secondary{background:var(--gray-100);color:var(--gray-800)}
  .btn-secondary:hover{background:var(--gray-200)}

  /* RESPONSE */
  .response-box{margin-top:14px;border:1px solid var(--gray-200);border-radius:6px;overflow:hidden}
  .response-header{padding:8px 12px;font-size:.75rem;font-weight:600;display:flex;justify-content:space-between;align-items:center}
  .response-header.ok{background:#dcfce7;color:var(--green)}
  .response-header.err{background:#fee2e2;color:#dc2626}
  .response-header.loading{background:#f3f4f6;color:var(--gray-600)}
  .response-body{background:#1e1e1e;color:#d4d4d4;padding:12px;font-size:.78rem;font-family:'Courier New',monospace;overflow-x:auto;max-height:350px;overflow-y:auto;white-space:pre-wrap;word-break:break-all}

  /* FILE INPUT */
  input[type="file"]{padding:4px;font-size:.8rem}

  /* Scrollbar */
  ::-webkit-scrollbar{width:6px;height:6px}
  ::-webkit-scrollbar-track{background:transparent}
  ::-webkit-scrollbar-thumb{background:var(--gray-200);border-radius:3px}
</style>
</head>
<body>

<nav id="sidebar">
  <div id="sidebar-header">
    <h1>🍽 API Explorer</h1>
    <p>Saveur Food Delivery API</p>
  </div>
  <div class="nav-section">
    <div class="nav-section-title">Authentication</div>
    <div class="nav-item active" onclick="showSection('auth')">🔐 Auth</div>
  </div>
  <div class="nav-section">
    <div class="nav-section-title">Resources</div>
    <div class="nav-item" onclick="showSection('users')">👥 Users</div>
    <div class="nav-item" onclick="showSection('restaurants')">🏪 Restaurants</div>
    <div class="nav-item" onclick="showSection('categories')">🗂 Categories</div>
    <div class="nav-item" onclick="showSection('menuitems')">🍔 Menu Items</div>
    <div class="nav-item" onclick="showSection('orders')">📦 Orders</div>
    <div class="nav-item" onclick="showSection('reviews')">⭐ Reviews</div>
    <div class="nav-item" onclick="showSection('reports')">📊 Reports</div>
  </div>
</nav>

<main id="main">
  <!-- TOKEN BAR -->
  <div id="token-bar">
    <label>🔑 Bearer Token:</label>
    <input type="text" id="token-input" placeholder="Paste your access token here after logging in…" oninput="updateTokenStatus()"/>
    <span id="token-status">Not set</span>
    <button class="btn btn-secondary" id="clear-token" onclick="clearToken()">Clear</button>
  </div>

  <!-- ===================== AUTH ===================== -->
  <div class="section active" id="section-auth">
    <div class="section-title">Authentication</div>
    <div class="section-desc">Register a new account, log in to get your access token, or fetch the current user profile.</div>

    <!-- Register -->
    <div class="card">
      <div class="card-header" onclick="toggle(this)">
        <span class="method-badge POST">POST</span>
        <span class="card-title">Register</span>
        <span class="card-url">/api/auth/register/</span>
        <span class="card-arrow">▼</span>
      </div>
      <div class="card-body">
        <div class="form-grid">
          <div class="form-row"><label>Username *</label><input id="reg-username" placeholder="johndoe"/></div>
          <div class="form-row"><label>Email *</label><input id="reg-email" type="email" placeholder="john@example.com"/></div>
          <div class="form-row"><label>Password * (min 6 chars)</label><input id="reg-password" type="password"/></div>
          <div class="form-row"><label>Role</label>
            <select id="reg-role"><option value="customer">Customer</option><option value="restaurant">Restaurant</option><option value="delivery">Delivery</option><option value="admin">Admin</option></select>
          </div>
          <div class="form-row"><label>First Name</label><input id="reg-fname" placeholder="John"/></div>
          <div class="form-row"><label>Last Name</label><input id="reg-lname" placeholder="Doe"/></div>
          <div class="form-row"><label>Phone</label><input id="reg-phone" placeholder="+855 12 345 678"/></div>
        </div>
        <button class="btn btn-primary" onclick="doRegister()">Register</button>
        <div id="res-register"></div>
      </div>
    </div>

    <!-- Login -->
    <div class="card">
      <div class="card-header" onclick="toggle(this)">
        <span class="method-badge POST">POST</span>
        <span class="card-title">Login</span>
        <span class="card-url">/api/auth/login/</span>
        <span class="card-arrow">▼</span>
      </div>
      <div class="card-body">
        <div class="form-row"><label>Username or Email *</label><input id="login-username" placeholder="johndoe or john@example.com"/></div>
        <div class="form-row"><label>Password *</label><input id="login-password" type="password"/></div>
        <button class="btn btn-primary" onclick="doLogin()">Login &amp; Set Token</button>
        <p class="form-hint" style="margin-top:8px">⚡ Successful login automatically sets your token above.</p>
        <div id="res-login"></div>
      </div>
    </div>

    <!-- Me -->
    <div class="card">
      <div class="card-header" onclick="toggle(this)">
        <span class="method-badge GET">GET</span>
        <span class="card-title">Get Current User (Me)</span>
        <span class="card-url">/api/auth/me/</span>
        <span class="card-arrow">▼</span>
      </div>
      <div class="card-body">
        <p class="form-hint" style="margin-bottom:12px">Requires a valid token set above.</p>
        <button class="btn btn-primary" onclick="doMe()">Fetch My Profile</button>
        <div id="res-me"></div>
      </div>
    </div>
  </div>

  <!-- ===================== USERS ===================== -->
  <div class="section" id="section-users">
    <div class="section-title">Users</div>
    <div class="section-desc">Manage user accounts. You can filter by role and search by username/email/name.</div>

    <div class="card">
      <div class="card-header" onclick="toggle(this)">
        <span class="method-badge GET">GET</span>
        <span class="card-title">List Users</span>
        <span class="card-url">/api/users/</span>
        <span class="card-arrow">▼</span>
      </div>
      <div class="card-body">
        <div class="form-grid">
          <div class="form-row"><label>Role filter</label>
            <select id="ul-role"><option value="">All roles</option><option value="customer">Customer</option><option value="restaurant">Restaurant</option><option value="delivery">Delivery</option><option value="admin">Admin</option></select>
          </div>
          <div class="form-row"><label>Search</label><input id="ul-search" placeholder="username, email, name…"/></div>
        </div>
        <button class="btn btn-primary" onclick="doUserList()">Fetch Users</button>
        <div id="res-user-list"></div>
      </div>
    </div>

    <div class="card">
      <div class="card-header" onclick="toggle(this)">
        <span class="method-badge GET">GET</span>
        <span class="card-title">Get User by ID</span>
        <span class="card-url">/api/users/{id}/</span>
        <span class="card-arrow">▼</span>
      </div>
      <div class="card-body">
        <div class="form-row"><label>User ID *</label><input id="u-get-id" type="number" placeholder="1"/></div>
        <button class="btn btn-primary" onclick="doUserGet()">Fetch User</button>
        <div id="res-user-get"></div>
      </div>
    </div>

    <div class="card">
      <div class="card-header" onclick="toggle(this)">
        <span class="method-badge PATCH">PATCH</span>
        <span class="card-title">Update User</span>
        <span class="card-url">/api/users/{id}/</span>
        <span class="card-arrow">▼</span>
      </div>
      <div class="card-body">
        <div class="form-row"><label>User ID *</label><input id="u-upd-id" type="number" placeholder="1"/></div>
        <div class="form-grid">
          <div class="form-row"><label>First Name</label><input id="u-upd-fname"/></div>
          <div class="form-row"><label>Last Name</label><input id="u-upd-lname"/></div>
          <div class="form-row"><label>Phone</label><input id="u-upd-phone"/></div>
          <div class="form-row"><label>Role</label>
            <select id="u-upd-role"><option value="">— unchanged —</option><option value="customer">Customer</option><option value="restaurant">Restaurant</option><option value="delivery">Delivery</option><option value="admin">Admin</option></select>
          </div>
        </div>
        <button class="btn btn-primary" onclick="doUserUpdate()">Update User</button>
        <div id="res-user-update"></div>
      </div>
    </div>

    <div class="card">
      <div class="card-header" onclick="toggle(this)">
        <span class="method-badge DELETE">DELETE</span>
        <span class="card-title">Delete User</span>
        <span class="card-url">/api/users/{id}/</span>
        <span class="card-arrow">▼</span>
      </div>
      <div class="card-body">
        <div class="form-row"><label>User ID *</label><input id="u-del-id" type="number" placeholder="1"/></div>
        <button class="btn btn-primary" onclick="doUserDelete()">Delete User</button>
        <div id="res-user-delete"></div>
      </div>
    </div>
  </div>

  <!-- ===================== RESTAURANTS ===================== -->
  <div class="section" id="section-restaurants">
    <div class="section-title">Restaurants</div>
    <div class="section-desc">Browse, create, and manage restaurant listings. Slugs are used as identifiers for detail operations.</div>

    <div class="card">
      <div class="card-header" onclick="toggle(this)">
        <span class="method-badge GET">GET</span>
        <span class="card-title">List Restaurants</span>
        <span class="card-url">/api/restaurants/</span>
        <span class="card-arrow">▼</span>
      </div>
      <div class="card-body">
        <div class="form-grid">
          <div class="form-row"><label>Search</label><input id="r-list-search" placeholder="name, cuisine, description…"/></div>
          <div class="form-row"><label>Order by</label>
            <select id="r-list-order"><option value="">Default</option><option value="rating">Rating</option><option value="-rating">Rating (desc)</option><option value="delivery_time">Delivery Time</option><option value="-created_at">Newest</option></select>
          </div>
        </div>
        <button class="btn btn-primary" onclick="doRestList()">Fetch Restaurants</button>
        <div id="res-rest-list"></div>
      </div>
    </div>

    <div class="card">
      <div class="card-header" onclick="toggle(this)">
        <span class="method-badge GET">GET</span>
        <span class="card-title">Get Restaurant by Slug</span>
        <span class="card-url">/api/restaurants/{slug}/</span>
        <span class="card-arrow">▼</span>
      </div>
      <div class="card-body">
        <div class="form-row"><label>Slug *</label><input id="r-get-slug" placeholder="my-restaurant"/></div>
        <button class="btn btn-primary" onclick="doRestGet()">Fetch Restaurant</button>
        <div id="res-rest-get"></div>
      </div>
    </div>

    <div class="card">
      <div class="card-header" onclick="toggle(this)">
        <span class="method-badge GET">GET</span>
        <span class="card-title">My Restaurants</span>
        <span class="card-url">/api/restaurants/mine/</span>
        <span class="card-arrow">▼</span>
      </div>
      <div class="card-body">
        <p class="form-hint" style="margin-bottom:12px">Returns restaurants owned by the authenticated user (or all when no token).</p>
        <button class="btn btn-primary" onclick="doRestMine()">Fetch My Restaurants</button>
        <div id="res-rest-mine"></div>
      </div>
    </div>

    <div class="card">
      <div class="card-header" onclick="toggle(this)">
        <span class="method-badge POST">POST</span>
        <span class="card-title">Create Restaurant</span>
        <span class="card-url">/api/restaurants/</span>
        <span class="card-arrow">▼</span>
      </div>
      <div class="card-body">
        <div class="form-grid">
          <div class="form-row"><label>Name *</label><input id="rc-name"/></div>
          <div class="form-row"><label>Cuisine *</label><input id="rc-cuisine" placeholder="Khmer, Italian…"/></div>
          <div class="form-row"><label>Address *</label><input id="rc-address"/></div>
          <div class="form-row"><label>Phone</label><input id="rc-phone"/></div>
          <div class="form-row"><label>Delivery Time (min)</label><input id="rc-deltime" type="number" value="30"/></div>
          <div class="form-row"><label>Delivery Fee ($)</label><input id="rc-delfee" type="number" step="0.01" value="0"/></div>
        </div>
        <div class="form-row"><label>Description</label><textarea id="rc-desc"></textarea></div>
        <div class="form-row"><label>Image</label><input id="rc-image" type="file" accept="image/*"/></div>
        <button class="btn btn-primary" onclick="doRestCreate()">Create Restaurant</button>
        <div id="res-rest-create"></div>
      </div>
    </div>

    <div class="card">
      <div class="card-header" onclick="toggle(this)">
        <span class="method-badge PATCH">PATCH</span>
        <span class="card-title">Update Restaurant</span>
        <span class="card-url">/api/restaurants/{slug}/</span>
        <span class="card-arrow">▼</span>
      </div>
      <div class="card-body">
        <div class="form-row"><label>Slug *</label><input id="ru-slug" placeholder="my-restaurant"/></div>
        <div class="form-grid">
          <div class="form-row"><label>Name</label><input id="ru-name"/></div>
          <div class="form-row"><label>Cuisine</label><input id="ru-cuisine"/></div>
          <div class="form-row"><label>Address</label><input id="ru-address"/></div>
          <div class="form-row"><label>Phone</label><input id="ru-phone"/></div>
          <div class="form-row"><label>Delivery Time</label><input id="ru-deltime" type="number"/></div>
          <div class="form-row"><label>Delivery Fee</label><input id="ru-delfee" type="number" step="0.01"/></div>
          <div class="form-row"><label>Is Open</label>
            <select id="ru-isopen"><option value="">— unchanged —</option><option value="true">Open</option><option value="false">Closed</option></select>
          </div>
        </div>
        <div class="form-row"><label>Description</label><textarea id="ru-desc"></textarea></div>
        <button class="btn btn-primary" onclick="doRestUpdate()">Update Restaurant</button>
        <div id="res-rest-update"></div>
      </div>
    </div>

    <div class="card">
      <div class="card-header" onclick="toggle(this)">
        <span class="method-badge DELETE">DELETE</span>
        <span class="card-title">Delete Restaurant</span>
        <span class="card-url">/api/restaurants/{slug}/</span>
        <span class="card-arrow">▼</span>
      </div>
      <div class="card-body">
        <div class="form-row"><label>Slug *</label><input id="rd-slug" placeholder="my-restaurant"/></div>
        <button class="btn btn-primary" onclick="doRestDelete()">Delete Restaurant</button>
        <div id="res-rest-delete"></div>
      </div>
    </div>
  </div>

  <!-- ===================== CATEGORIES ===================== -->
  <div class="section" id="section-categories">
    <div class="section-title">Categories</div>
    <div class="section-desc">Manage menu categories that belong to a restaurant.</div>

    <div class="card">
      <div class="card-header" onclick="toggle(this)">
        <span class="method-badge GET">GET</span>
        <span class="card-title">List Categories</span>
        <span class="card-url">/api/categories/</span>
        <span class="card-arrow">▼</span>
      </div>
      <div class="card-body">
        <button class="btn btn-primary" onclick="doCatList()">Fetch All Categories</button>
        <div id="res-cat-list"></div>
      </div>
    </div>

    <div class="card">
      <div class="card-header" onclick="toggle(this)">
        <span class="method-badge GET">GET</span>
        <span class="card-title">Get Category by ID</span>
        <span class="card-url">/api/categories/{id}/</span>
        <span class="card-arrow">▼</span>
      </div>
      <div class="card-body">
        <div class="form-row"><label>Category ID *</label><input id="cg-id" type="number" placeholder="1"/></div>
        <button class="btn btn-primary" onclick="doCatGet()">Fetch Category</button>
        <div id="res-cat-get"></div>
      </div>
    </div>

    <div class="card">
      <div class="card-header" onclick="toggle(this)">
        <span class="method-badge POST">POST</span>
        <span class="card-title">Create Category</span>
        <span class="card-url">/api/categories/</span>
        <span class="card-arrow">▼</span>
      </div>
      <div class="card-body">
        <div class="form-grid">
          <div class="form-row"><label>Restaurant ID *</label><input id="cc-restaurant" type="number" placeholder="1"/></div>
          <div class="form-row"><label>Name *</label><input id="cc-name" placeholder="Appetizers"/></div>
          <div class="form-row"><label>Sort Order</label><input id="cc-sort" type="number" value="0"/></div>
        </div>
        <button class="btn btn-primary" onclick="doCatCreate()">Create Category</button>
        <div id="res-cat-create"></div>
      </div>
    </div>

    <div class="card">
      <div class="card-header" onclick="toggle(this)">
        <span class="method-badge PATCH">PATCH</span>
        <span class="card-title">Update Category</span>
        <span class="card-url">/api/categories/{id}/</span>
        <span class="card-arrow">▼</span>
      </div>
      <div class="card-body">
        <div class="form-row"><label>Category ID *</label><input id="cu-id" type="number" placeholder="1"/></div>
        <div class="form-grid">
          <div class="form-row"><label>Name</label><input id="cu-name"/></div>
          <div class="form-row"><label>Sort Order</label><input id="cu-sort" type="number"/></div>
        </div>
        <button class="btn btn-primary" onclick="doCatUpdate()">Update Category</button>
        <div id="res-cat-update"></div>
      </div>
    </div>

    <div class="card">
      <div class="card-header" onclick="toggle(this)">
        <span class="method-badge DELETE">DELETE</span>
        <span class="card-title">Delete Category</span>
        <span class="card-url">/api/categories/{id}/</span>
        <span class="card-arrow">▼</span>
      </div>
      <div class="card-body">
        <div class="form-row">
          <label>Category ID *</label>
          <input id="cd-id" type="number" placeholder="Enter Category ID"/>
          <span class="form-hint">Enter the ID of the Category to delete</span>
        </div>
        <button class="btn btn-primary" onclick="doCatDelete()">Delete Category</button>
        <div id="res-cat-delete"></div>
      </div>
    </div>
  </div>

  <!-- ===================== MENU ITEMS ===================== -->
  <div class="section" id="section-menuitems">
    <div class="section-title">Menu Items</div>
    <div class="section-desc">Add and manage food/drink items on a restaurant's menu. Filter by restaurant using its ID or slug.</div>

    <div class="card">
      <div class="card-header" onclick="toggle(this)">
        <span class="method-badge GET">GET</span>
        <span class="card-title">List Menu Items</span>
        <span class="card-url">/api/menu-items/</span>
        <span class="card-arrow">▼</span>
      </div>
      <div class="card-body">
        <div class="form-grid">
          <div class="form-row"><label>Restaurant (ID or slug)</label><input id="mi-list-rest" placeholder="1 or my-restaurant"/></div>
          <div class="form-row"><label>Search</label><input id="mi-list-search" placeholder="name, description…"/></div>
        </div>
        <button class="btn btn-primary" onclick="doMiList()">Fetch Menu Items</button>
        <div id="res-mi-list"></div>
      </div>
    </div>

    <div class="card">
      <div class="card-header" onclick="toggle(this)">
        <span class="method-badge GET">GET</span>
        <span class="card-title">Get Menu Item by ID</span>
        <span class="card-url">/api/menu-items/{id}/</span>
        <span class="card-arrow">▼</span>
      </div>
      <div class="card-body">
        <div class="form-row"><label>Menu Item ID *</label><input id="mi-get-id" type="number" placeholder="1"/></div>
        <button class="btn btn-primary" onclick="doMiGet()">Fetch Item</button>
        <div id="res-mi-get"></div>
      </div>
    </div>

    <div class="card">
      <div class="card-header" onclick="toggle(this)">
        <span class="method-badge POST">POST</span>
        <span class="card-title">Create Menu Item</span>
        <span class="card-url">/api/menu-items/</span>
        <span class="card-arrow">▼</span>
      </div>
      <div class="card-body">
        <div class="form-grid">
          <div class="form-row"><label>Restaurant ID *</label><input id="mic-rest" type="number" placeholder="1"/></div>
          <div class="form-row"><label>Category ID</label><input id="mic-cat" type="number" placeholder="(optional)"/></div>
          <div class="form-row"><label>Name *</label><input id="mic-name" placeholder="Beef Lok Lak"/></div>
          <div class="form-row"><label>Price *</label><input id="mic-price" type="number" step="0.01" placeholder="8.50"/></div>
          <div class="form-row"><label>Available</label>
            <select id="mic-avail"><option value="true">Yes</option><option value="false">No</option></select>
          </div>
          <div class="form-row"><label>Featured</label>
            <select id="mic-featured"><option value="false">No</option><option value="true">Yes</option></select>
          </div>
        </div>
        <div class="form-row"><label>Description</label><textarea id="mic-desc"></textarea></div>
        <div class="form-row"><label>Image</label><input id="mic-image" type="file" accept="image/*"/></div>
        <button class="btn btn-primary" onclick="doMiCreate()">Create Menu Item</button>
        <div id="res-mi-create"></div>
      </div>
    </div>

    <div class="card">
      <div class="card-header" onclick="toggle(this)">
        <span class="method-badge PATCH">PATCH</span>
        <span class="card-title">Update Menu Item</span>
        <span class="card-url">/api/menu-items/{id}/</span>
        <span class="card-arrow">▼</span>
      </div>
      <div class="card-body">
        <div class="form-row"><label>Menu Item ID *</label><input id="miu-id" type="number" placeholder="1"/></div>
        <div class="form-grid">
          <div class="form-row"><label>Name</label><input id="miu-name"/></div>
          <div class="form-row"><label>Price</label><input id="miu-price" type="number" step="0.01"/></div>
          <div class="form-row"><label>Category ID</label><input id="miu-cat" type="number"/></div>
          <div class="form-row"><label>Available</label>
            <select id="miu-avail"><option value="">— unchanged —</option><option value="true">Yes</option><option value="false">No</option></select>
          </div>
        </div>
        <div class="form-row"><label>Description</label><textarea id="miu-desc"></textarea></div>
        <button class="btn btn-primary" onclick="doMiUpdate()">Update Menu Item</button>
        <div id="res-mi-update"></div>
      </div>
    </div>

    <div class="card">
      <div class="card-header" onclick="toggle(this)">
        <span class="method-badge DELETE">DELETE</span>
        <span class="card-title">Delete Menu Item</span>
        <span class="card-url">/api/menu-items/{id}/</span>
        <span class="card-arrow">▼</span>
      </div>
      <div class="card-body">
        <div class="form-row"><label>Menu Item ID *</label><input id="mid-id" type="number" placeholder="1"/></div>
        <button class="btn btn-primary" onclick="doMiDelete()">Delete Menu Item</button>
        <div id="res-mi-delete"></div>
      </div>
    </div>
  </div>

  <!-- ===================== ORDERS ===================== -->
  <div class="section" id="section-orders">
    <div class="section-title">Orders</div>
    <div class="section-desc">Place, view, and manage delivery orders. Includes driver assignment and receipt upload.</div>

    <div class="card">
      <div class="card-header" onclick="toggle(this)">
        <span class="method-badge GET">GET</span>
        <span class="card-title">List Orders</span>
        <span class="card-url">/api/orders/</span>
        <span class="card-arrow">▼</span>
      </div>
      <div class="card-body">
        <p class="form-hint" style="margin-bottom:12px">Returns all orders (or filtered by role when token is set).</p>
        <button class="btn btn-primary" onclick="doOrderList()">Fetch Orders</button>
        <div id="res-order-list"></div>
      </div>
    </div>

    <div class="card">
      <div class="card-header" onclick="toggle(this)">
        <span class="method-badge GET">GET</span>
        <span class="card-title">Available Orders (Delivery Pool)</span>
        <span class="card-url">/api/orders/available/</span>
        <span class="card-arrow">▼</span>
      </div>
      <div class="card-body">
        <p class="form-hint" style="margin-bottom:12px">Unclaimed orders ready for drivers to accept.</p>
        <button class="btn btn-primary" onclick="doOrderAvailable()">Fetch Available Orders</button>
        <div id="res-order-avail"></div>
      </div>
    </div>

    <div class="card">
      <div class="card-header" onclick="toggle(this)">
        <span class="method-badge GET">GET</span>
        <span class="card-title">Get Order by ID</span>
        <span class="card-url">/api/orders/{id}/</span>
        <span class="card-arrow">▼</span>
      </div>
      <div class="card-body">
        <div class="form-row"><label>Order ID *</label><input id="og-id" type="number" placeholder="1"/></div>
        <button class="btn btn-primary" onclick="doOrderGet()">Fetch Order</button>
        <div id="res-order-get"></div>
      </div>
    </div>

    <div class="card">
      <div class="card-header" onclick="toggle(this)">
        <span class="method-badge POST">POST</span>
        <span class="card-title">Create Order</span>
        <span class="card-url">/api/orders/</span>
        <span class="card-arrow">▼</span>
      </div>
      <div class="card-body">
        <div class="form-grid">
          <div class="form-row"><label>Restaurant ID *</label><input id="oc-rest" type="number" placeholder="1"/></div>
          <div class="form-row"><label>Address ID</label><input id="oc-addr" type="number"/></div>
          <div class="form-row"><label>Subtotal *</label><input id="oc-sub" type="number" step="0.01" placeholder="12.00"/></div>
          <div class="form-row"><label>Delivery Fee *</label><input id="oc-fee" type="number" step="0.01" value="0"/></div>
          <div class="form-row"><label>Tax *</label><input id="oc-tax" type="number" step="0.01" value="0"/></div>
          <div class="form-row"><label>Total *</label><input id="oc-total" type="number" step="0.01" placeholder="12.00"/></div>
          <div class="form-row"><label>Payment Method</label>
            <select id="oc-pay"><option value="cash">Cash on Delivery</option><option value="card">Card</option><option value="wallet">Wallet</option></select>
          </div>
        </div>
        <div class="form-row"><label>Notes</label><textarea id="oc-notes" placeholder="Any special requests…"></textarea></div>
        <div class="form-row">
          <label>Items (JSON array) *</label>
          <textarea id="oc-items" placeholder='[{"menu_item": 1, "name": "Beef Lok Lak", "price": "8.50", "quantity": 2}]'></textarea>
          <span class="form-hint">Each item: menu_item (ID), name, price, quantity</span>
        </div>
        <button class="btn btn-primary" onclick="doOrderCreate()">Place Order</button>
        <div id="res-order-create"></div>
      </div>
    </div>

    <div class="card">
      <div class="card-header" onclick="toggle(this)">
        <span class="method-badge POST">POST</span>
        <span class="card-title">Update Order Status</span>
        <span class="card-url">/api/orders/{id}/update_status/</span>
        <span class="card-arrow">▼</span>
      </div>
      <div class="card-body">
        <div class="form-row"><label>Order ID *</label><input id="os-id" type="number" placeholder="1"/></div>
        <div class="form-row"><label>New Status *</label>
          <select id="os-status">
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="preparing">Preparing</option>
            <option value="ready">Ready</option>
            <option value="out_for_delivery">Out for Delivery</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
        <button class="btn btn-primary" onclick="doOrderStatus()">Update Status</button>
        <div id="res-order-status"></div>
      </div>
    </div>

    <div class="card">
      <div class="card-header" onclick="toggle(this)">
        <span class="method-badge POST">POST</span>
        <span class="card-title">Accept Order (Driver)</span>
        <span class="card-url">/api/orders/{id}/accept/</span>
        <span class="card-arrow">▼</span>
      </div>
      <div class="card-body">
        <div class="form-row"><label>Order ID *</label><input id="oa-id" type="number" placeholder="1"/></div>
        <button class="btn btn-primary" onclick="doOrderAccept()">Accept Order</button>
        <div id="res-order-accept"></div>
      </div>
    </div>

    <div class="card">
      <div class="card-header" onclick="toggle(this)">
        <span class="method-badge POST">POST</span>
        <span class="card-title">Assign Driver to Order</span>
        <span class="card-url">/api/orders/{id}/assign_driver/</span>
        <span class="card-arrow">▼</span>
      </div>
      <div class="card-body">
        <div class="form-row"><label>Order ID *</label><input id="odr-id" type="number" placeholder="1"/></div>
        <div class="form-row"><label>Driver User ID *</label><input id="odr-driver" type="number" placeholder="5"/></div>
        <button class="btn btn-primary" onclick="doOrderAssign()">Assign Driver</button>
        <div id="res-order-assign"></div>
      </div>
    </div>

    <div class="card">
      <div class="card-header" onclick="toggle(this)">
        <span class="method-badge POST">POST</span>
        <span class="card-title">Upload Payment Receipt</span>
        <span class="card-url">/api/orders/{id}/upload_receipt/</span>
        <span class="card-arrow">▼</span>
      </div>
      <div class="card-body">
        <div class="form-row"><label>Order ID *</label><input id="or-id" type="number" placeholder="1"/></div>
        <div class="form-row"><label>Receipt Image *</label><input id="or-file" type="file" accept="image/*"/></div>
        <button class="btn btn-primary" onclick="doOrderReceipt()">Upload Receipt</button>
        <div id="res-order-receipt"></div>
      </div>
    </div>
  </div>

  <!-- ===================== REVIEWS ===================== -->
  <div class="section" id="section-reviews">
    <div class="section-title">Reviews</div>
    <div class="section-desc">Read and post customer reviews for restaurants. Rating is 1–5 stars.</div>

    <div class="card">
      <div class="card-header" onclick="toggle(this)">
        <span class="method-badge GET">GET</span>
        <span class="card-title">List Reviews</span>
        <span class="card-url">/api/reviews/</span>
        <span class="card-arrow">▼</span>
      </div>
      <div class="card-body">
        <div class="form-row"><label>Filter by Restaurant ID</label><input id="rv-rest" type="number" placeholder="(optional)"/></div>
        <button class="btn btn-primary" onclick="doRevList()">Fetch Reviews</button>
        <div id="res-rev-list"></div>
      </div>
    </div>

    <div class="card">
      <div class="card-header" onclick="toggle(this)">
        <span class="method-badge GET">GET</span>
        <span class="card-title">Get Review by ID</span>
        <span class="card-url">/api/reviews/{id}/</span>
        <span class="card-arrow">▼</span>
      </div>
      <div class="card-body">
        <div class="form-row"><label>Review ID *</label><input id="rvg-id" type="number" placeholder="1"/></div>
        <button class="btn btn-primary" onclick="doRevGet()">Fetch Review</button>
        <div id="res-rev-get"></div>
      </div>
    </div>

    <div class="card">
      <div class="card-header" onclick="toggle(this)">
        <span class="method-badge POST">POST</span>
        <span class="card-title">Create Review</span>
        <span class="card-url">/api/reviews/</span>
        <span class="card-arrow">▼</span>
      </div>
      <div class="card-body">
        <div class="form-grid">
          <div class="form-row"><label>Restaurant ID *</label><input id="rvc-rest" type="number" placeholder="1"/></div>
          <div class="form-row"><label>Order ID</label><input id="rvc-order" type="number" placeholder="(optional)"/></div>
          <div class="form-row"><label>Rating (1-5) *</label>
            <select id="rvc-rating"><option value="5">⭐⭐⭐⭐⭐ 5</option><option value="4">⭐⭐⭐⭐ 4</option><option value="3">⭐⭐⭐ 3</option><option value="2">⭐⭐ 2</option><option value="1">⭐ 1</option></select>
          </div>
        </div>
        <div class="form-row"><label>Comment</label><textarea id="rvc-comment" placeholder="Your experience…"></textarea></div>
        <button class="btn btn-primary" onclick="doRevCreate()">Submit Review</button>
        <div id="res-rev-create"></div>
      </div>
    </div>

    <div class="card">
      <div class="card-header" onclick="toggle(this)">
        <span class="method-badge PATCH">PATCH</span>
        <span class="card-title">Update Review</span>
        <span class="card-url">/api/reviews/{id}/</span>
        <span class="card-arrow">▼</span>
      </div>
      <div class="card-body">
        <div class="form-row"><label>Review ID *</label><input id="rvu-id" type="number" placeholder="1"/></div>
        <div class="form-row"><label>Rating</label>
          <select id="rvu-rating"><option value="">— unchanged —</option><option value="5">⭐⭐⭐⭐⭐ 5</option><option value="4">⭐⭐⭐⭐ 4</option><option value="3">⭐⭐⭐ 3</option><option value="2">⭐⭐ 2</option><option value="1">⭐ 1</option></select>
        </div>
        <div class="form-row"><label>Comment</label><textarea id="rvu-comment"></textarea></div>
        <button class="btn btn-primary" onclick="doRevUpdate()">Update Review</button>
        <div id="res-rev-update"></div>
      </div>
    </div>

    <div class="card">
      <div class="card-header" onclick="toggle(this)">
        <span class="method-badge DELETE">DELETE</span>
        <span class="card-title">Delete Review</span>
        <span class="card-url">/api/reviews/{id}/</span>
        <span class="card-arrow">▼</span>
      </div>
      <div class="card-body">
        <div class="form-row"><label>Review ID *</label><input id="rvd-id" type="number" placeholder="1"/></div>
        <button class="btn btn-primary" onclick="doRevDelete()">Delete Review</button>
        <div id="res-rev-delete"></div>
      </div>
    </div>
  </div>

  <!-- ===================== REPORTS ===================== -->
  <div class="section" id="section-reports">
    <div class="section-title">Reports</div>
    <div class="section-desc">Platform-level summary statistics: total orders, revenue, customer count, average rating, and more.</div>
    <div class="card">
      <div class="card-header" onclick="toggle(this)">
        <span class="method-badge GET">GET</span>
        <span class="card-title">Summary Report</span>
        <span class="card-url">/api/reports/summary/</span>
        <span class="card-arrow">▼</span>
      </div>
      <div class="card-body">
        <button class="btn btn-primary" onclick="doReport()">Fetch Summary</button>
        <div id="res-report"></div>
      </div>
    </div>
  </div>

</main>

<script>
// ── Helpers ──────────────────────────────────────────────────────────────────
const BASE = '';  // same origin

function getToken(){
  return document.getElementById('token-input').value.trim();
}
function authHeaders(extra={}){
  const t = getToken();
  const h = {'Content-Type':'application/json',...extra};
  if(t) h['Authorization'] = 'Bearer '+t;
  return h;
}
function updateTokenStatus(){
  const t = getToken();
  const el = document.getElementById('token-status');
  if(t){el.textContent='Token set ✓';el.className='set';}
  else{el.textContent='Not set';el.className='';}
}
function clearToken(){
  document.getElementById('token-input').value='';
  updateTokenStatus();
}

async function callApi(method, url, body=null, isFormData=false){
  const opts = {method};
  if(isFormData){
    const t=getToken();
    opts.headers = t ? {'Authorization':'Bearer '+t} : {};
    opts.body = body;
  } else {
    opts.headers = authHeaders();
    if(body) opts.body = JSON.stringify(body);
  }
  const res = await fetch(BASE+url, opts);
  let data;
  try{ data = await res.json(); }
  catch{ data = {detail:'(empty response)'}; }
  return {ok:res.ok, status:res.status, data};
}

function showResponse(id, result){
  const el = document.getElementById(id);
  if(!el) return;
  const cls = result.ok ? 'ok' : 'err';
  const statusText = result.ok ? '✅ '+result.status+' OK' : '❌ '+result.status+' Error';
  el.innerHTML = `
    <div class="response-box">
      <div class="response-header ${cls}">
        <span>${statusText}</span>
        <span style="font-family:monospace;font-weight:400">${new Date().toLocaleTimeString()}</span>
      </div>
      <div class="response-body">${JSON.stringify(result.data, null, 2)}</div>
    </div>`;
}

function showLoading(id){
  document.getElementById(id).innerHTML=
    `<div class="response-box"><div class="response-header loading">⏳ Sending request…</div></div>`;
}

function val(id){ return document.getElementById(id)?.value?.trim() || ''; }
function numVal(id){ const v=val(id); return v ? Number(v) : null; }

// ── Navigation ────────────────────────────────────────────────────────────────
function showSection(name){
  document.querySelectorAll('.section').forEach(s=>s.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n=>n.classList.remove('active'));
  document.getElementById('section-'+name).classList.add('active');
  event.currentTarget.classList.add('active');
  window.scrollTo(0,0);
}

// ── Card Accordion ────────────────────────────────────────────────────────────
function toggle(header){
  header.classList.toggle('open');
  const body = header.nextElementSibling;
  body.classList.toggle('open');
  header.querySelector('.card-arrow').textContent = body.classList.contains('open') ? '▲' : '▼';
}

// ── AUTH ──────────────────────────────────────────────────────────────────────
async function doRegister(){
  showLoading('res-register');
  const body={username:val('reg-username'),email:val('reg-email'),password:val('reg-password'),
    role:val('reg-role'),phone:val('reg-phone'),first_name:val('reg-fname'),last_name:val('reg-lname')};
  if(!body.username||!body.email||!body.password){showResponse('res-register',{ok:false,status:400,data:{detail:'Username, email, and password are required.'}});return;}
  const r = await callApi('POST','/api/auth/register/',body);
  if(r.ok && r.data.access){
    document.getElementById('token-input').value = r.data.access;
    updateTokenStatus();
  }
  showResponse('res-register',r);
}

async function doLogin(){
  showLoading('res-login');
  const body={username:val('login-username'),password:val('login-password')};
  if(!body.username||!body.password){showResponse('res-login',{ok:false,status:400,data:{detail:'Username and password are required.'}});return;}
  const r = await callApi('POST','/api/auth/login/',body);
  if(r.ok && r.data.access){
    document.getElementById('token-input').value = r.data.access;
    updateTokenStatus();
  }
  showResponse('res-login',r);
}

async function doMe(){
  showLoading('res-me');
  const r = await callApi('GET','/api/auth/me/');
  showResponse('res-me',r);
}

// ── USERS ─────────────────────────────────────────────────────────────────────
async function doUserList(){
  showLoading('res-user-list');
  let url='/api/users/?';
  const role=val('ul-role'); if(role) url+='role='+role+'&';
  const s=val('ul-search'); if(s) url+='search='+encodeURIComponent(s);
  showResponse('res-user-list', await callApi('GET',url));
}
async function doUserGet(){
  const id=val('u-get-id'); if(!id){alert('Enter a user ID');return;}
  showLoading('res-user-get');
  showResponse('res-user-get', await callApi('GET','/api/users/'+id+'/'));
}
async function doUserUpdate(){
  const id=val('u-upd-id'); if(!id){alert('Enter a user ID');return;}
  const body={};
  const fn=val('u-upd-fname'); if(fn) body.first_name=fn;
  const ln=val('u-upd-lname'); if(ln) body.last_name=ln;
  const ph=val('u-upd-phone'); if(ph) body.phone=ph;
  const ro=val('u-upd-role'); if(ro) body.role=ro;
  showLoading('res-user-update');
  showResponse('res-user-update', await callApi('PATCH','/api/users/'+id+'/',body));
}
async function doUserDelete(){
  const id=val('u-del-id'); if(!id){alert('Enter a user ID');return;}
  if(!confirm('Delete user #'+id+'?')) return;
  showLoading('res-user-delete');
  const opts={method:'DELETE',headers:authHeaders()};
  const res=await fetch(BASE+'/api/users/'+id+'/',opts);
  showResponse('res-user-delete',{ok:res.ok,status:res.status,data:res.status===204?{detail:'User deleted successfully.'}:await res.json().catch(()=>({}))});
}

// ── RESTAURANTS ───────────────────────────────────────────────────────────────
async function doRestList(){
  showLoading('res-rest-list');
  let url='/api/restaurants/?';
  const s=val('r-list-search'); if(s) url+='search='+encodeURIComponent(s)+'&';
  const o=val('r-list-order'); if(o) url+='ordering='+o;
  showResponse('res-rest-list', await callApi('GET',url));
}
async function doRestGet(){
  const slug=val('r-get-slug'); if(!slug){alert('Enter a slug');return;}
  showLoading('res-rest-get');
  showResponse('res-rest-get', await callApi('GET','/api/restaurants/'+slug+'/'));
}
async function doRestMine(){
  showLoading('res-rest-mine');
  showResponse('res-rest-mine', await callApi('GET','/api/restaurants/mine/'));
}
async function doRestCreate(){
  const name=val('rc-name'),cuisine=val('rc-cuisine'),address=val('rc-address');
  if(!name||!cuisine||!address){alert('Name, cuisine, and address are required');return;}
  showLoading('res-rest-create');
  const fd=new FormData();
  fd.append('name',name); fd.append('cuisine',cuisine); fd.append('address',address);
  const ph=val('rc-phone'); if(ph) fd.append('phone',ph);
  const dt=val('rc-deltime'); if(dt) fd.append('delivery_time',dt);
  const df=val('rc-delfee'); if(df) fd.append('delivery_fee',df);
  const desc=val('rc-desc'); if(desc) fd.append('description',desc);
  const img=document.getElementById('rc-image').files[0]; if(img) fd.append('image',img);
  showResponse('res-rest-create', await callApi('POST','/api/restaurants/',fd,true));
}
async function doRestUpdate(){
  const slug=val('ru-slug'); if(!slug){alert('Enter a slug');return;}
  showLoading('res-rest-update');
  const body={};
  const n=val('ru-name'); if(n) body.name=n;
  const c=val('ru-cuisine'); if(c) body.cuisine=c;
  const a=val('ru-address'); if(a) body.address=a;
  const p=val('ru-phone'); if(p) body.phone=p;
  const dt=val('ru-deltime'); if(dt) body.delivery_time=Number(dt);
  const df=val('ru-delfee'); if(df) body.delivery_fee=Number(df);
  const io=val('ru-isopen'); if(io) body.is_open=(io==='true');
  const d=val('ru-desc'); if(d) body.description=d;
  showResponse('res-rest-update', await callApi('PATCH','/api/restaurants/'+slug+'/',body));
}
async function doRestDelete(){
  const slug=val('rd-slug'); if(!slug){alert('Enter a slug');return;}
  if(!confirm('Delete restaurant "'+slug+'"?')) return;
  showLoading('res-rest-delete');
  const opts={method:'DELETE',headers:authHeaders()};
  const res=await fetch(BASE+'/api/restaurants/'+slug+'/',opts);
  showResponse('res-rest-delete',{ok:res.ok,status:res.status,data:res.status===204?{detail:'Restaurant deleted successfully.'}:await res.json().catch(()=>({}))});
}

// ── CATEGORIES ────────────────────────────────────────────────────────────────
async function doCatList(){
  showLoading('res-cat-list');
  showResponse('res-cat-list', await callApi('GET','/api/categories/'));
}
async function doCatGet(){
  const id=val('cg-id'); if(!id){alert('Enter a category ID');return;}
  showLoading('res-cat-get');
  showResponse('res-cat-get', await callApi('GET','/api/categories/'+id+'/'));
}
async function doCatCreate(){
  const rest=val('cc-restaurant'),name=val('cc-name');
  if(!rest||!name){alert('Restaurant ID and name are required');return;}
  showLoading('res-cat-create');
  const body={restaurant:Number(rest),name};
  const so=val('cc-sort'); if(so!=='') body.sort_order=Number(so);
  showResponse('res-cat-create', await callApi('POST','/api/categories/',body));
}
async function doCatUpdate(){
  const id=val('cu-id'); if(!id){alert('Enter a category ID');return;}
  const body={};
  const n=val('cu-name'); if(n) body.name=n;
  const s=val('cu-sort'); if(s!=='') body.sort_order=Number(s);
  showLoading('res-cat-update');
  showResponse('res-cat-update', await callApi('PATCH','/api/categories/'+id+'/',body));
}
async function doCatDelete(){
  const id=val('cd-id'); if(!id){alert('Enter a category ID');return;}
  if(!confirm('Delete category #'+id+'?')) return;
  showLoading('res-cat-delete');
  const opts={method:'DELETE',headers:authHeaders()};
  const res=await fetch(BASE+'/api/categories/'+id+'/',opts);
  showResponse('res-cat-delete',{ok:res.ok,status:res.status,data:res.status===204?{detail:'Category deleted successfully.'}:await res.json().catch(()=>({}))});
}

// ── MENU ITEMS ────────────────────────────────────────────────────────────────
async function doMiList(){
  showLoading('res-mi-list');
  let url='/api/menu-items/?';
  const r=val('mi-list-rest'); if(r) url+='restaurant='+r+'&';
  const s=val('mi-list-search'); if(s) url+='search='+encodeURIComponent(s);
  showResponse('res-mi-list', await callApi('GET',url));
}
async function doMiGet(){
  const id=val('mi-get-id'); if(!id){alert('Enter a menu item ID');return;}
  showLoading('res-mi-get');
  showResponse('res-mi-get', await callApi('GET','/api/menu-items/'+id+'/'));
}
async function doMiCreate(){
  const rest=val('mic-rest'),name=val('mic-name'),price=val('mic-price');
  if(!rest||!name||!price){alert('Restaurant ID, name, and price are required');return;}
  showLoading('res-mi-create');
  const fd=new FormData();
  fd.append('restaurant',rest); fd.append('name',name); fd.append('price',price);
  const cat=val('mic-cat'); if(cat) fd.append('category',cat);
  const desc=val('mic-desc'); if(desc) fd.append('description',desc);
  fd.append('is_available',val('mic-avail'));
  fd.append('is_featured',val('mic-featured'));
  const img=document.getElementById('mic-image').files[0]; if(img) fd.append('image',img);
  showResponse('res-mi-create', await callApi('POST','/api/menu-items/',fd,true));
}
async function doMiUpdate(){
  const id=val('miu-id'); if(!id){alert('Enter a menu item ID');return;}
  const body={};
  const n=val('miu-name'); if(n) body.name=n;
  const p=val('miu-price'); if(p) body.price=Number(p);
  const c=val('miu-cat'); if(c) body.category=Number(c);
  const a=val('miu-avail'); if(a) body.is_available=(a==='true');
  const d=val('miu-desc'); if(d) body.description=d;
  showLoading('res-mi-update');
  showResponse('res-mi-update', await callApi('PATCH','/api/menu-items/'+id+'/',body));
}
async function doMiDelete(){
  const id=val('mid-id'); if(!id){alert('Enter a menu item ID');return;}
  if(!confirm('Delete menu item #'+id+'?')) return;
  showLoading('res-mi-delete');
  const opts={method:'DELETE',headers:authHeaders()};
  const res=await fetch(BASE+'/api/menu-items/'+id+'/',opts);
  showResponse('res-mi-delete',{ok:res.ok,status:res.status,data:res.status===204?{detail:'Menu item deleted successfully.'}:await res.json().catch(()=>({}))});
}

// ── ORDERS ────────────────────────────────────────────────────────────────────
async function doOrderList(){
  showLoading('res-order-list');
  showResponse('res-order-list', await callApi('GET','/api/orders/'));
}
async function doOrderAvailable(){
  showLoading('res-order-avail');
  showResponse('res-order-avail', await callApi('GET','/api/orders/available/'));
}
async function doOrderGet(){
  const id=val('og-id'); if(!id){alert('Enter an order ID');return;}
  showLoading('res-order-get');
  showResponse('res-order-get', await callApi('GET','/api/orders/'+id+'/'));
}
async function doOrderCreate(){
  const rest=val('oc-rest'),sub=val('oc-sub'),total=val('oc-total');
  if(!rest||!sub||!total){alert('Restaurant ID, subtotal, and total are required');return;}
  let items;
  try{ items=JSON.parse(val('oc-items')||'[]'); }
  catch{ alert('Items must be valid JSON'); return; }
  const body={
    restaurant:Number(rest), subtotal:Number(sub),
    delivery_fee:Number(val('oc-fee')||0),
    tax:Number(val('oc-tax')||0),
    total:Number(total),
    payment_method:val('oc-pay'),
    notes:val('oc-notes'), items
  };
  const addr=val('oc-addr'); if(addr) body.address=Number(addr);
  showLoading('res-order-create');
  showResponse('res-order-create', await callApi('POST','/api/orders/',body));
}
async function doOrderStatus(){
  const id=val('os-id'); if(!id){alert('Enter an order ID');return;}
  showLoading('res-order-status');
  showResponse('res-order-status', await callApi('POST','/api/orders/'+id+'/update_status/',{status:val('os-status')}));
}
async function doOrderAccept(){
  const id=val('oa-id'); if(!id){alert('Enter an order ID');return;}
  showLoading('res-order-accept');
  showResponse('res-order-accept', await callApi('POST','/api/orders/'+id+'/accept/'));
}
async function doOrderAssign(){
  const id=val('odr-id'),driver=val('odr-driver');
  if(!id||!driver){alert('Order ID and driver ID are required');return;}
  showLoading('res-order-assign');
  showResponse('res-order-assign', await callApi('POST','/api/orders/'+id+'/assign_driver/',{driver_id:Number(driver)}));
}
async function doOrderReceipt(){
  const id=val('or-id'); if(!id){alert('Enter an order ID');return;}
  const file=document.getElementById('or-file').files[0]; if(!file){alert('Select an image file');return;}
  showLoading('res-order-receipt');
  const fd=new FormData(); fd.append('payment_receipt',file);
  showResponse('res-order-receipt', await callApi('POST','/api/orders/'+id+'/upload_receipt/',fd,true));
}

// ── REVIEWS ───────────────────────────────────────────────────────────────────
async function doRevList(){
  showLoading('res-rev-list');
  let url='/api/reviews/?';
  const r=val('rv-rest'); if(r) url+='restaurant='+r;
  showResponse('res-rev-list', await callApi('GET',url));
}
async function doRevGet(){
  const id=val('rvg-id'); if(!id){alert('Enter a review ID');return;}
  showLoading('res-rev-get');
  showResponse('res-rev-get', await callApi('GET','/api/reviews/'+id+'/'));
}
async function doRevCreate(){
  const rest=val('rvc-rest'),rating=val('rvc-rating');
  if(!rest||!rating){alert('Restaurant ID and rating are required');return;}
  const body={restaurant:Number(rest),rating:Number(rating),comment:val('rvc-comment')};
  const o=val('rvc-order'); if(o) body.order=Number(o);
  showLoading('res-rev-create');
  showResponse('res-rev-create', await callApi('POST','/api/reviews/',body));
}
async function doRevUpdate(){
  const id=val('rvu-id'); if(!id){alert('Enter a review ID');return;}
  const body={};
  const r=val('rvu-rating'); if(r) body.rating=Number(r);
  const c=val('rvu-comment'); if(c) body.comment=c;
  showLoading('res-rev-update');
  showResponse('res-rev-update', await callApi('PATCH','/api/reviews/'+id+'/',body));
}
async function doRevDelete(){
  const id=val('rvd-id'); if(!id){alert('Enter a review ID');return;}
  if(!confirm('Delete review #'+id+'?')) return;
  showLoading('res-rev-delete');
  const opts={method:'DELETE',headers:authHeaders()};
  const res=await fetch(BASE+'/api/reviews/'+id+'/',opts);
  showResponse('res-rev-delete',{ok:res.ok,status:res.status,data:res.status===204?{detail:'Review deleted successfully.'}:await res.json().catch(()=>({}))});
}

// ── REPORTS ───────────────────────────────────────────────────────────────────
async function doReport(){
  showLoading('res-report');
  showResponse('res-report', await callApi('GET','/api/reports/summary/'));
}
</script>
</body>
</html>"""
    return HttpResponse(html, content_type='text/html; charset=utf-8')
