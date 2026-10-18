function toggleMenu() {
  document.getElementById("mainNav")?.classList.toggle("show");
}

function getParam(name) {
  return new URLSearchParams(window.location.search).get(name);
}

function formatPrice(price) {
  return `₹${Number(price).toLocaleString("en-IN")}`;
}

function cardHTML(c) {
  return `
    <article class="camera-card">
      <img src="${c.image}" alt="${c.name}" loading="lazy">
      <div class="camera-body">
        <div class="card-top">
          <span class="tag">${c.category}</span>
          <span class="rating">★ ${c.rating}</span>
        </div>
        <h3>${c.name}</h3>
        <p><i class="fa-solid fa-location-dot"></i> ${c.location} · ${c.experience}</p>
        <p class="muted">${c.bio}</p>
        <div class="price-row">
          <strong>${formatPrice(c.price)}</strong>
          <span>/ day</span>
          <a href="profile.html?id=${c.id}" class="btn btn-small">View Profile</a>
        </div>
      </div>
    </article>
  `;
}

function renderCards(list, targetId) {
  const target = document.getElementById(targetId);
  if (!target) return;

  target.innerHTML = list.length
    ? list.map(cardHTML).join("")
    : `<div class="empty">No cameramen found. Try another search.</div>`;
}

function filterHomeCards() {
  const search = (document.getElementById("homeSearch")?.value || "").toLowerCase().trim();
  const category = document.getElementById("homeCategory")?.value || "";

  const list = cameramen.filter(c => {
    const searchable = `${c.name} ${c.category} ${c.location} ${c.services.join(" ")}`.toLowerCase();
    return (!search || searchable.includes(search)) &&
           (!category || c.category === category);
  });

  renderCards(list, "homeCards");
}

function applyFilters() {
  const search = (document.getElementById("filterSearch")?.value || "").toLowerCase().trim();
  const category = document.getElementById("filterCategory")?.value || "";
  const maxPrice = Number(document.getElementById("maxPrice")?.value || 999999);

  const list = cameramen.filter(c => {
    const searchable = `${c.name} ${c.category} ${c.location} ${c.services.join(" ")}`.toLowerCase();
    return (!search || searchable.includes(search)) &&
           (!category || c.category === category) &&
           c.price <= maxPrice;
  });

  renderCards(list, "allCards");
}

function renderProfile(id) {
  const target = document.getElementById("profileBox");
  if (!target) return;

  const cameraman = cameramen.find(c => c.id === id) || cameramen[0];

  target.innerHTML = `
    <div class="profile-hero">
      <img src="${cameraman.image}" alt="${cameraman.name}">
      <div>
        <span class="tag">${cameraman.category}</span>
        <h1>${cameraman.name}</h1>
        <p><i class="fa-solid fa-location-dot"></i> ${cameraman.location} · ${cameraman.experience} experience</p>
        <div class="big-rating">★ ${cameraman.rating} <small>Professional rating</small></div>
        <p>${cameraman.bio}</p>
        <a class="btn" href="booking.html?cameraman=${cameraman.id}">
          Book Now · ${formatPrice(cameraman.price)}/day
        </a>
      </div>
    </div>

    <div class="profile-content">
      <div>
        <h2>Services</h2>
        <div class="chips">
          ${cameraman.services.map(service => `<span>${service}</span>`).join("")}
        </div>

        <h2>Portfolio</h2>
        <div class="portfolio">
          <img src="${cameraman.image}" alt="Portfolio 1">
          <img src="https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=800&auto=format&fit=crop" alt="Portfolio 2">
          <img src="https://images.unsplash.com/photo-1537633552985-df8429e8048b?q=80&w=800&auto=format&fit=crop" alt="Portfolio 3">
        </div>
      </div>

      <aside class="side-card">
        <h3>Quick Booking</h3>
        <p>Starting from</p>
        <h2>${formatPrice(cameraman.price)} <small>/ day</small></h2>
        <a class="btn full" href="booking.html?cameraman=${cameraman.id}">Request Booking</a>
        <a class="btn btn-outline full" href="https://wa.me/919999999999" target="_blank" rel="noopener">
          WhatsApp
        </a>
      </aside>
    </div>
  `;
}

function setupBooking() {
  const select = document.getElementById("bookingCameraman");
  const form = document.getElementById("bookingForm");
  if (!select || !form) return;

  select.insertAdjacentHTML(
    "beforeend",
    cameramen.map(c => `<option value="${c.id}">${c.name} — ${formatPrice(c.price)}/day</option>`).join("")
  );

  const selectedId = Number(getParam("cameraman"));
  if (selectedId) select.value = String(selectedId);

  form.addEventListener("submit", event => {
    event.preventDefault();

    const selected = cameramen.find(c => c.id === Number(select.value));
    if (!selected) return;

    const booking = {
      id: Date.now(),
      cameraman: selected.name,
      date: document.getElementById("bookingDate").value,
      service: document.getElementById("bookingService").value,
      location: document.getElementById("bookingLocation").value,
      status: "Pending"
    };

    const bookings = JSON.parse(localStorage.getItem("lenshireBookings") || "[]");
    bookings.push(booking);
    localStorage.setItem("lenshireBookings", JSON.stringify(bookings));

    document.getElementById("bookingMsg").innerHTML = `
      <div class="success">
        Booking request sent to <strong>${selected.name}</strong>.
        Your request is pending confirmation.
      </div>
    `;

    form.reset();
  });
}

function renderDashboard() {
  const target = document.getElementById("dashboardData");
  if (!target) return;

  const bookings = JSON.parse(localStorage.getItem("lenshireBookings") || "[]");

  target.innerHTML = `
    <div class="stat-grid">
      <div><strong>${bookings.length}</strong><span>Total Bookings</span></div>
      <div><strong>${bookings.filter(b => b.status === "Pending").length}</strong><span>Pending</span></div>
      <div><strong>${bookings.filter(b => b.status === "Confirmed").length}</strong><span>Confirmed</span></div>
    </div>

    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Cameraman</th>
            <th>Service</th>
            <th>Date</th>
            <th>Location</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          ${
            bookings.length
              ? bookings.map(b => `
                  <tr>
                    <td>${b.cameraman}</td>
                    <td>${b.service}</td>
                    <td>${b.date}</td>
                    <td>${b.location}</td>
                    <td><span class="status">${b.status}</span></td>
                  </tr>
                `).join("")
              : `<tr><td colspan="5" class="empty">No bookings yet. <a href="cameramen.html">Find a cameraman</a></td></tr>`
          }
        </tbody>
      </table>
    </div>
  `;
}

function demoLogin(event) {
  event.preventDefault();
  localStorage.setItem("lenshireUser", document.getElementById("email").value);
  window.location.href = "dashboard.html";
}

document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("homeCards")) {
    renderCards(cameramen.slice(0, 3), "homeCards");
  }

  if (document.getElementById("allCards")) {
    const query = (getParam("q") || "").toLowerCase();
    const category = getParam("category") || "";

    document.getElementById("filterSearch").value = query;
    document.getElementById("filterCategory").value = category;
    applyFilters();
  }

  const profileId = getParam("id");
  if (profileId && document.getElementById("profileBox")) {
    renderProfile(Number(profileId));
  }

  if (document.getElementById("bookingForm")) {
    setupBooking();
  }

  if (document.getElementById("dashboardData")) {
    renderDashboard();
  }
});
