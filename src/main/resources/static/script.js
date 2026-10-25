/* =====================================================
   SBPBS
   SMART BUILDING PLANNING & BLUEPRINT SUGGESTION SYSTEM
===================================================== */


/* SBPBS REST API integration. When Spring Boot is running, saved projects are persisted in MySQL. */
const SBPBS_API = { base: "/api" };
async function sbpbsApi(path, options = {}) {
    const response = await fetch(SBPBS_API.base + path, {
        headers: { "Content-Type": "application/json", ...(options.headers || {}) },
        ...options
    });
    if (!response.ok) {
        const message = await response.text();
        throw new Error(message || `API request failed (${response.status})`);
    }
    if (response.status === 204) return null;
    return response.json();
}

/* =====================================================
   GLOBAL STATE
===================================================== */

const SBPBS = {

    currentStep: 0,

    currentAnalysis: null,

    projects: [],

    images: [],

    zoom: 1,

    authMode: "login"

};


/* =====================================================
   HELPER FUNCTIONS
===================================================== */

function get(id) {
    return document.getElementById(id);
}


function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}


function showToast(message) {

    const toast = get("toast");
    const toastMessage = get("toastMessage");

    if (!toast || !toastMessage) {
        return;
    }

    toastMessage.textContent = message;

    toast.classList.add("show");

    clearTimeout(window.sbpbsToastTimer);

    window.sbpbsToastTimer = setTimeout(() => {

        toast.classList.remove("show");

    }, 2500);
}


function formatNumber(value) {

    return Number(value || 0).toLocaleString("en-IN", {
        maximumFractionDigits: 2
    });

}


function formatCurrency(value) {

    return Number(value || 0).toLocaleString("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0
    });

}


function scrollToSection(id) {

    const section = get(id);

    if (!section) {
        return;
    }

    section.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });

}


/* =====================================================
   GENERATION SECTION
   IMPORTANT:
   These functions prevent:
   "Can't find variable: showGenerationSection"
===================================================== */

function showGenerationSection() {

    const section = get("generationSection");

    if (section) {
        section.classList.remove("hidden");
    }

}


function hideGenerationSection() {

    const section = get("generationSection");

    if (section) {
        section.classList.add("hidden");
    }

}


/* =====================================================
   NAVIGATION
===================================================== */

function setupNavigation() {

    const menuToggle = get("menuToggle");
    const navLinks = get("navLinks");

    if (menuToggle && navLinks) {

        menuToggle.addEventListener("click", () => {

            navLinks.classList.toggle("open");

        });

    }


    document.querySelectorAll(".nav-link").forEach(link => {

        link.addEventListener("click", () => {

            if (navLinks) {
                navLinks.classList.remove("open");
            }

        });

    });


    const sections = document.querySelectorAll("section[id]");

    window.addEventListener("scroll", () => {

        let current = "home";

        sections.forEach(section => {

            const top = section.offsetTop - 150;

            if (window.scrollY >= top) {
                current = section.id;
            }

        });


        document.querySelectorAll(".nav-link").forEach(link => {

            link.classList.remove("active");

            if (link.getAttribute("href") === "#" + current) {
                link.classList.add("active");
            }

        });

    });

}


/* =====================================================
   STEPPER
===================================================== */

function updateStepper() {

    const steps = document.querySelectorAll(".step");
    const formSteps = document.querySelectorAll(".form-step");

    steps.forEach((step, index) => {

        step.classList.remove("active", "completed");

        if (index < SBPBS.currentStep) {
            step.classList.add("completed");
        }

        if (index === SBPBS.currentStep) {
            step.classList.add("active");
        }

    });


    formSteps.forEach((step, index) => {

        step.classList.toggle(
            "active",
            index === SBPBS.currentStep
        );

    });


    const prev = get("prevStepBtn");
    const next = get("nextStepBtn");
    const generate = get("generateBtn");

    if (prev) {
        prev.style.visibility =
            SBPBS.currentStep === 0
                ? "hidden"
                : "visible";
    }


    if (next && generate) {

        if (SBPBS.currentStep === formSteps.length - 1) {

            next.classList.add("hidden");
            generate.classList.remove("hidden");

        } else {

            next.classList.remove("hidden");
            generate.classList.add("hidden");

        }

    }

}


/* =====================================================
   AREA CALCULATION
===================================================== */

function calculateArea() {

    const length = parseFloat(get("length")?.value || 0);
    const width = parseFloat(get("width")?.value || 0);
    const unit = get("unit")?.value || "ft";

    if (!length || !width) {
        return;
    }

    let area = length * width;

    if (unit === "m") {

        area = area * 10.7639;

    }

    const areaField = get("area");

    if (areaField) {

        areaField.value = area.toFixed(2);

    }

}


/* =====================================================
   FORM DATA
===================================================== */

function getFormData() {

    const data = {

        projectName: get("projectName")?.value.trim() || "Untitled Project",

        owner: get("owner")?.value.trim() || "",

        location: get("location")?.value.trim() || "",

        length: parseFloat(get("length")?.value || 0),

        width: parseFloat(get("width")?.value || 0),

        unit: get("unit")?.value || "ft",
leftSetback: parseFloat(get("leftSetback")?.value || 0),
rightSetback: parseFloat(get("rightSetback")?.value || 0),
frontSetback: parseFloat(get("frontSetback")?.value || 0),
rearSetback: parseFloat(get("rearSetback")?.value || 0),
        area: parseFloat(get("area")?.value || 0),

        soil: get("soil")?.value || "Loamy",

        slope: get("slope")?.value || "Flat",

        road: get("road")?.value || "Available",

        water: get("water")?.value || "Available",

        direction: get("direction")?.value || "North",

        latitude: get("latitude")?.value || "",

        longitude: get("longitude")?.value || "",

        type: get("type")?.value || "Residential",

        floors: parseInt(get("floors")?.value || 1),

        beds: parseInt(get("beds")?.value || 0),

        baths: parseInt(get("baths")?.value || 0),

        parking: get("parking")?.value || "Not Required",

        budget: parseFloat(get("budget")?.value || 0),

        style: get("style")?.value || "Modern",

        solar: get("solar")?.checked || false,

        garden: get("garden")?.checked || false,

        terrace: get("terrace")?.checked || false,

        accessibility: get("accessibility")?.checked || false,

        smartLighting: get("smartLighting")?.checked || false,

        security: get("security")?.checked || false,

        rainwater: get("rainwater")?.checked || false,

        energy: get("energy")?.checked || false,

        other: get("other")?.value.trim() || "",

        images: SBPBS.images

    };

    return data;

}


/* =====================================================
   VALIDATION
===================================================== */

function validateStep(step) {

    const formSteps = document.querySelectorAll(".form-step");

    const current = formSteps[step];

    if (!current) {
        return true;
    }

    const requiredInputs =
        current.querySelectorAll("[required]");

    for (const input of requiredInputs) {

        if (!input.value.trim()) {

            input.focus();

            showToast("Please complete the required fields.");

            return false;

        }

    }

    return true;

}


function validateAllInputs() {


    calculateArea();

    const data = getFormData();

    if (!data.length || !data.width) {

        showToast("Please enter valid plot dimensions.");

        scrollToSection("plan");

        return false;

    }

    if (data.length <= 0 || data.width <= 0) {

        showToast("Plot dimensions must be greater than zero.");

        return false;

    }

    if (data.floors < 1) {

        showToast("Number of floors must be at least 1.");

        return false;

    }

    return true;

}


/* =====================================================
   SITE ANALYSIS
===================================================== */

function analyzeSite(data) {

    const plotArea = data.area;

    const coverage = 0.75;

    const footprint = plotArea * coverage;

    const openArea = plotArea - footprint;

    const recommendations = [];

    if (data.soil === "Clay") {

        recommendations.push({
            title: "Soil consideration",
            text: "Clay soil may require professional soil investigation and suitable foundation design."
        });

    }

    if (data.soil === "Sandy") {

        recommendations.push({
            title: "Soil consideration",
            text: "Sandy soil should be professionally assessed for bearing capacity and foundation suitability."
        });

    }

    if (data.slope !== "Flat") {

        recommendations.push({
            title: "Slope consideration",
            text: "The site has a slope. Professional grading and drainage planning should be considered."
        });

    }

    if (data.road === "None") {

        recommendations.push({
            title: "Access",
            text: "Road access is marked unavailable. Site accessibility should be verified before planning."
        });

    }

    if (data.water === "None") {

        recommendations.push({
            title: "Water availability",
            text: "No water source was selected. Plan an appropriate water supply solution."
        });

    }

    if (openArea < plotArea * 0.2) {

        recommendations.push({
            title: "Open space",
            text: "Consider maintaining adequate open space around the proposed building footprint."
        });

    }

    return {

        plotArea,
        footprint,
        openArea,
        coverage,

        recommendations

    };

}


/* =====================================================
   COST ENGINE
===================================================== */

function getRate(style) {

    const rates = {

        Minimal: 1700,

        Traditional: 1900,

        Modern: 2200,

        Eco: 2400

    };

    return rates[style] || 2200;

}


function calculateCost(data, builtArea) {

    const rate = getRate(data.style);

    const cost = builtArea * rate;

    return {

        rate,

        cost

    };

}


/* =====================================================
   SPACE ALLOCATION
===================================================== */

function calculateSpaces(data, footprint) {

    let remaining = footprint;

    const spaces = [];

    const living = footprint * 0.22;
    const bedrooms = Math.max(
        data.beds * footprint * 0.10,
        footprint * 0.15
    );

    const kitchen = footprint * 0.10;

    const bathrooms = Math.max(
        data.baths * 45,
        footprint * 0.06
    );

    const parking =
        data.parking === "Required"
            ? Math.min(250, footprint * 0.14)
            : 0;


    spaces.push({
        name: "Living",
        area: living
    });

    spaces.push({
        name: "Bedrooms",
        area: bedrooms
    });

    spaces.push({
        name: "Kitchen",
        area: kitchen
    });

    spaces.push({
        name: "Bathrooms",
        area: bathrooms
    });

    if (parking > 0) {

        spaces.push({
            name: "Parking",
            area: parking
        });

    }


    const used =
        spaces.reduce(
            (sum, item) => sum + item.area,
            0
        );


    remaining = Math.max(
        footprint - used,
        0
    );


    spaces.push({
        name: "Other",
        area: remaining
    });


    return spaces;

}


/* =====================================================
   RECOMMENDATION ENGINE
===================================================== */

function generateRecommendations(data, site, cost) {

    const recommendations = [];

    recommendations.push(...site.recommendations);


    if (data.direction === "East") {

        recommendations.push({
            title: "Orientation",
            text: "Use the selected east orientation as a reference while developing openings and circulation."
        });

    }


    if (data.floors >= 3) {

        recommendations.push({
            title: "Multi-floor planning",
            text: "Higher floor counts require professional structural and vertical circulation planning."
        });

    }


    if (data.parking === "Required") {

        recommendations.push({
            title: "Parking",
            text: "Reserve a clear entry and circulation area for vehicle movement."
        });

    }


    if (data.solar) {

        recommendations.push({
            title: "Solar energy",
            text: "Provide a suitable roof area and access for future solar installation."
        });

    } else {

        recommendations.push({
            title: "Sustainability",
            text: "Solar energy can be considered if roof area and budget permit."
        });

    }


    if (data.rainwater) {

        recommendations.push({
            title: "Rainwater harvesting",
            text: "Include a suitable collection and storage/recharge strategy."
        });

    }


    if (data.garden) {

        recommendations.push({
            title: "Green space",
            text: "Allocate part of the open area for landscaping or garden space."
        });

    }


    if (data.smartLighting) {

        recommendations.push({
            title: "Smart lighting",
            text: "Consider occupancy and daylight-based lighting controls."
        });

    }


    if (data.security) {

        recommendations.push({
            title: "Security",
            text: "Security cameras, controlled entry and sensors can be considered."
        });

    }


    if (data.accessibility) {

        recommendations.push({
            title: "Accessibility",
            text: "Provide accessible circulation, entrances and suitable bathroom planning."
        });

    }


    if (data.budget > 0) {

        if (data.budget < cost.cost) {

            recommendations.push({
                title: "Budget warning",
                text:
                    "The entered budget is below the prototype construction estimate. Consider reducing area, changing style or revising the budget."
            });

        } else {

            recommendations.push({
                title: "Budget",
                text:
                    "The entered budget is above the current prototype construction estimate."
            });

        }

    }


    recommendations.push({
        title: "Professional verification",
        text:
            "The generated result is preliminary and must be verified by qualified professionals before construction."
    });


    return recommendations;

}


/* =====================================================
   COMPLETE ANALYSIS
===================================================== */

function analyzeProject(data) {

    calculateArea();

    const site = analyzeSite(data);

    const totalBuiltArea =
        site.footprint * data.floors;

    const cost =
        calculateCost(
            data,
            totalBuiltArea
        );

    const spaces =
        calculateSpaces(
            data,
            site.footprint
        );

    const recommendations =
        generateRecommendations(
            data,
            site,
            cost
        );


    return {

        data,

        site,

        totalBuiltArea,

        cost,

        spaces,

        recommendations

    };

}


/* =====================================================
   GENERATION PROGRESS
===================================================== */

function setGenerationProgress(percent, message, activeStep) {

    const progress = get("generationProgress");
    const messageElement = get("generationMessage");

    if (progress) {
        progress.style.width = percent + "%";
    }

    if (messageElement) {
        messageElement.textContent = message;
    }


    for (let i = 1; i <= 5; i++) {

        const step = get("g" + i);

        if (!step) {
            continue;
        }

        step.classList.remove("active");

        if (i <= activeStep) {
            step.classList.add("active");
        }

    }

}


/* =====================================================
   MAIN GENERATION
===================================================== */

async function runGeneration() {

    if (!validateAllInputs()) {
        return;
    }


    showGenerationSection();


    setGenerationProgress(
        10,
        "Collecting project requirements...",
        1
    );

    await wait(500);


    const data = getFormData();


    setGenerationProgress(
        30,
        "Analyzing site parameters...",
        2
    );

    await wait(600);


    const analysis =
        analyzeProject(data);

    try {
        analysis.backendAnalysis = await sbpbsApi("/analyze", {
            method: "POST", body: JSON.stringify(data)
        });
        analysis.backendBlueprint = await sbpbsApi("/blueprint", {
            method: "POST", body: JSON.stringify(data)
        });
        // Keep displayed totals aligned with the backend's validated calculations.
        if (Number.isFinite(Number(analysis.backendAnalysis.plotAreaSqFt))) {
            analysis.site.plotArea = Number(analysis.backendAnalysis.plotAreaSqFt);
            analysis.site.footprint = Number(analysis.backendAnalysis.assumedBuildableAreaSqFt);
            analysis.site.openArea = Number(analysis.backendAnalysis.openAreaSqFt);
            analysis.site.coverage = Number(analysis.backendAnalysis.assumedCoverage);
            analysis.totalBuiltArea = Number(analysis.backendAnalysis.totalBuiltAreaSqFt);
            analysis.cost.cost = Number(analysis.backendAnalysis.estimatedCostINR);
            analysis.cost.rate = Number(analysis.backendAnalysis.costRatePerSqFt);
        }
    } catch (error) {
        console.warn("Backend analysis/blueprint unavailable; using frontend preview.", error);
        if (error.message) showToast("Backend analysis unavailable; using the local preliminary preview.");
    }
    SBPBS.currentAnalysis = analysis;


    setGenerationProgress(
        50,
        "Analyzing building requirements...",
        3
    );

    await wait(600);


    setGenerationProgress(
        75,
        "Generating preliminary blueprint...",
        4
    );

    renderBlueprint(analysis);

    await wait(700);


    setGenerationProgress(
        95,
        "Preparing dashboard results...",
        5
    );

    renderDashboard(analysis);

    await wait(500);


    setGenerationProgress(
        100,
        "Plan generated successfully.",
        5
    );

    await wait(400);


    hideGenerationSection();

    scrollToSection("blueprint");

    showToast("Preliminary plan generated successfully.");

}


/* =====================================================
   SVG BLUEPRINT
===================================================== */

function generateBlueprintSVG(analysis) {
    const data = analysis.data;
    const backend = analysis.backendBlueprint;
    const rooms = backend?.rooms?.length ? backend.rooms : buildLocalRoomGrid(data);
    
const plotW = 600, plotH = 400, margin = 60;

const plotLengthFt = Number(backend?.plotLengthFt) || Number(data.length) || 1;
const plotWidthFt = Number(backend?.plotWidthFt) || Number(data.width) || 1;
const unitFactor = String(data.unit || "ft").toLowerCase() === "m" ? 3.28084 : 1;

const leftFt = Number(backend?.leftSetbackFt) || 0;
const rightFt = Number(backend?.rightSetbackFt) || 0;
const frontFt = Number(backend?.frontSetbackFt) || 0;
const rearFt = Number(backend?.rearSetbackFt) || 0;

const plotRatio = plotLengthFt / plotWidthFt;
const scale = Math.min(plotW / plotWidthFt, plotH / plotLengthFt);

const drawnPlotW = plotWidthFt * scale;
const drawnPlotH = plotLengthFt * scale;
const plotX = margin + (plotW - drawnPlotW) / 2;
const plotY = 55 + (plotH - drawnPlotH) / 2;

const buildingW = Math.max(0, drawnPlotW - (leftFt + rightFt) * scale);
const buildingH = Math.max(0, drawnPlotH - (frontFt + rearFt) * scale);

const bx = plotX + leftFt * scale;
const by = plotY + frontFt * scale;

    const colors = ["#102345", "#17183d", "#142c35", "#2a2140", "#163247"];
    const esc = value => String(value ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
    const roomSvg = rooms.map((room, index) => {
        const x = bx + Number(room.x || 0) * buildingW;
        const y = by + Number(room.y || 0) * buildingH;
        const w = Number(room.width || 1) * buildingW;
        const h = Number(room.height || 1) * buildingH;
        const label = esc(room.name);
        const font = Math.max(7, Math.min(13, Math.min(w, h) / 5));
        const actualLength = Number(room.widthFt);
        const actualWidth = Number(room.heightFt);
        const dims = Number.isFinite(actualLength) && Number.isFinite(actualWidth)
            ? `${actualLength.toFixed(1)} ft × ${actualWidth.toFixed(1)} ft`
            : `${(Number(room.width) * (Number(data.length) || 1)).toFixed(1)} × ${(Number(room.height) * (Number(data.width) || 1)).toFixed(1)} ${esc(data.unit || "ft")}`;
        const area = Number(room.areaSqFt);
        const detail = Number.isFinite(area) ? `${area.toFixed(0)} sq ft` : "concept room";
        const centerX = x + w / 2;
        const centerY = y + h / 2;
        const labelY = h >= 44 ? centerY - 5 : centerY;
        const detailY = centerY + Math.min(13, h / 4);
        const detailSvg = h >= 35 && w >= 62
            ? `<text x="${centerX}" y="${detailY + 12}" fill="#a9dce8" font-size="${Math.max(6, font - 3)}" text-anchor="middle" font-family="Arial">${esc(dims)}</text>`
            : "";
        return `<g data-room-type="${esc(room.type || "room")}"><rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${colors[index % colors.length]}" stroke="#d6f8ff" stroke-width="2"/><text x="${centerX}" y="${labelY}" fill="#f0fcff" font-size="${font}" text-anchor="middle" dominant-baseline="middle" font-family="Arial">${label}</text>${detailSvg}<title>${label} — ${esc(dims)}, ${esc(detail)}</title></g>`;
    }).join("");
    return `<svg xmlns="http://www.w3.org/2000/svg" width="760" height="540" viewBox="0 0 760 540" role="img" aria-label="Conceptual preliminary room layout">
      <rect width="760" height="540" fill="#070c18"/>
      <text x="380" y="30" fill="#00e5ff" font-size="18" text-anchor="middle" font-family="Arial" font-weight="bold">PRELIMINARY CONCEPT PLAN</text>
      <rect x="${plotX}" y="${plotY}" width="${drawnPlotW}" height="${drawnPlotH}" fill="rgba(0,229,255,0.025)" stroke="#00e5ff" stroke-width="2"/>
      <line x1="700" y1="80" x2="700" y2="130" stroke="#00e5ff" stroke-width="2"/><polygon points="700,65 692,82 708,82" fill="#00e5ff"/><text x="700" y="150" fill="#00e5ff" font-size="13" text-anchor="middle" font-family="Arial">N</text>
      <rect x="${bx}" y="${by}" width="${buildingW}" height="${buildingH}" fill="#0c1730" stroke="#8b5cf6" stroke-width="3"/>
      ${roomSvg}
      <text x="360" y="485" fill="#8be9ff" font-size="12" text-anchor="middle" font-family="Arial">Plot: ${esc(data.length)} × ${esc(data.width)} ${esc(data.unit)} · weighted room partitions</text>
      <text x="360" y="505" fill="#a9b7d0" font-size="10" text-anchor="middle" font-family="Arial">Room dimensions are algorithmic estimates; verify all site and code constraints.</text>
    </svg>`;
}

function buildLocalRoomGrid(data) {
    const names = ["Living", "Kitchen"];
    const beds = Math.max(0, Math.min(12, Number(data.beds) || 0));
    const baths = Math.max(0, Math.min(8, Number(data.baths) || 0));
    for (let i = 1; i <= beds; i++) names.push(`Bedroom ${i}`);
    for (let i = 1; i <= baths; i++) names.push(`Bathroom ${i}`);
    if (data.parking === "Required") names.push("Parking");
    const count = names.length;
    const ratio = Math.max(0.35, Math.min(2.8, (Number(data.length) || 1) / (Number(data.width) || 1)));
    const columns = Math.max(1, Math.min(count, Math.ceil(Math.sqrt(count * ratio))));
    const rows = Math.ceil(count / columns);
    return names.map((name, index) => ({
        name, x: (index % columns) / columns, y: Math.floor(index / columns) / rows,
        width: 1 / columns, height: 1 / rows
    }));
}

/* =====================================================
   RENDER BLUEPRINT
===================================================== */

function renderBlueprint(analysis) {

    const container = get("svgBlueprint");
    const empty = get("blueprintEmpty");

    if (!container) {
        return;
    }


    const svgMarkup =
        generateBlueprintSVG(analysis);


    container.innerHTML = svgMarkup;

    container.style.display = "block";

    if (empty) {
        empty.style.display = "none";
    }


    const data = analysis.data;


    if (get("bpProject")) {
        get("bpProject").textContent =
            data.projectName;
    }

    if (get("bpPlot")) {
        get("bpPlot").textContent =
            formatNumber(
                analysis.site.plotArea
            ) + " sq.ft";
    }

    if (get("bpFootprint")) {
        get("bpFootprint").textContent =
            formatNumber(
                analysis.site.footprint
            ) + " sq.ft";
    }

    if (get("bpOpen")) {
        get("bpOpen").textContent =
            formatNumber(
                analysis.site.openArea
            ) + " sq.ft";
    }


    SBPBS.zoom = 1;

    applyBlueprintZoom();

}


/* =====================================================
   BLUEPRINT ZOOM
===================================================== */

function applyBlueprintZoom() {

    const container = get("svgBlueprint");

    if (!container) {
        return;
    }

    container.style.transform =
        `scale(${SBPBS.zoom})`;


    const zoomValue = get("zoomValue");

    if (zoomValue) {

        zoomValue.textContent =
            Math.round(SBPBS.zoom * 100) + "%";

    }

}


/* =====================================================
   DASHBOARD
===================================================== */

function renderDashboard(analysis) {

    const empty = get("dashboardEmpty");
    const content = get("dashboardContent");

    if (empty) {
        empty.classList.add("hidden");
    }

    if (content) {
        content.classList.remove("hidden");
    }


    const site = analysis.site;


    if (get("metricPlot")) {

        get("metricPlot").textContent =
            formatNumber(site.plotArea);

    }


    if (get("metricFootprint")) {

        get("metricFootprint").textContent =
            formatNumber(site.footprint);

    }


    if (get("metricOpen")) {

        get("metricOpen").textContent =
            formatNumber(site.openArea);

    }


    if (get("metricBuilt")) {

        get("metricBuilt").textContent =
            formatNumber(analysis.totalBuiltArea);

    }


    if (get("metricCoverage")) {

        get("metricCoverage").textContent =
            Math.round(site.coverage * 100) + "%";

    }


    if (get("metricFloors")) {

        get("metricFloors").textContent =
            analysis.data.floors;

    }


    renderSiteAnalysis(analysis);

    renderBudget(analysis);

    renderCharts(analysis);

    renderRecommendations(analysis);

}


/* =====================================================
   SITE ANALYSIS DASHBOARD
===================================================== */

function renderSiteAnalysis(analysis) {

    const container =
        get("siteAnalysisList");

    if (!container) {
        return;
    }


    const data = analysis.data;
    const site = analysis.site;


    const items = [

        ["Plot Dimensions",
            `${data.length} × ${data.width} ${data.unit}`],

        ["Plot Area",
            `${formatNumber(site.plotArea)} sq.ft`],

        ["Ground Coverage",
            `${Math.round(site.coverage * 100)}%`],

        ["Open Area",
            `${formatNumber(site.openArea)} sq.ft`],

        ["Soil Type",
            data.soil],

        ["Slope",
            data.slope],

        ["Road",
            data.road],

        ["Water",
            data.water],

        ["Orientation",
            data.direction]

    ];


    container.innerHTML = items.map(item => `

        <div class="analysis-item">

            <span>${item[0]}</span>

            <strong>${item[1]}</strong>

        </div>

    `).join("");

}


/* =====================================================
   BUDGET
===================================================== */

function renderBudget(analysis) {

    const estimatedCost =
        get("estimatedCost");

    const budgetStatus =
        get("budgetStatus");

    const budgetBar =
        get("budgetBar");

    const breakdown =
        get("budgetBreakdown");


    const cost =
        analysis.cost.cost;

    const budget =
        analysis.data.budget;


    if (estimatedCost) {

        estimatedCost.textContent =
            formatCurrency(cost);

    }


    let status = "No budget entered";

    if (budget > 0) {

        if (budget >= cost) {

            status = "Within entered budget";

        } else {

            status = "Above entered budget";

        }

    }


    if (budgetStatus) {

        budgetStatus.textContent =
            status;

    }


    if (budgetBar) {

        let percentage = 50;

        if (budget > 0) {

            percentage =
                Math.min(
                    (cost / budget) * 100,
                    100
                );

        }

        budgetBar.style.width =
            percentage + "%";

    }


    if (breakdown) {

        const structure = cost * 0.40;
        const finishing = cost * 0.30;
        const electrical = cost * 0.10;
        const plumbing = cost * 0.08;
        const other = cost * 0.12;


        const rows = [

            ["Structure", structure],
            ["Finishing", finishing],
            ["Electrical", electrical],
            ["Plumbing", plumbing],
            ["Other", other]

        ];


        breakdown.innerHTML =
            rows.map(row => `

                <div class="budget-row">

                    <span>${row[0]}</span>

                    <strong>
                        ${formatCurrency(row[1])}
                    </strong>

                </div>

            `).join("");

    }

}


/* =====================================================
   CHARTS
===================================================== */

function createBars(items) {

    const max =
        Math.max(
            ...items.map(item => item.value),
            1
        );


    return items.map(item => {

        const height =
            Math.max(
                (item.value / max) * 180,
                8
            );


        return `

            <div
                class="chart-bar"
                style="height:${height}px"
                title="${item.name}: ${formatNumber(item.value)}"
            >

                <span>
                    ${item.name}
                </span>

            </div>

        `;

    }).join("");

}


function renderCharts(analysis) {

    const areaChart = get("areaChart");
    const spaceChart = get("spaceChart");
    const budgetChart = get("budgetChart");


    if (areaChart) {

        areaChart.innerHTML =
            createBars([

                {
                    name: "Built",
                    value: analysis.site.footprint
                },

                {
                    name: "Open",
                    value: analysis.site.openArea
                }

            ]);

    }


    if (spaceChart) {

        spaceChart.innerHTML =
            createBars(

                analysis.spaces
                    .filter(item => item.area > 0)
                    .map(item => ({
                        name: item.name,
                        value: item.area
                    }))

            );

    }


    if (budgetChart) {

        const cost =
            analysis.cost.cost;


        budgetChart.innerHTML =
            createBars([

                {
                    name: "Structure",
                    value: cost * 0.40
                },

                {
                    name: "Finish",
                    value: cost * 0.30
                },

                {
                    name: "Electrical",
                    value: cost * 0.10
                },

                {
                    name: "Plumbing",
                    value: cost * 0.08
                },

                {
                    name: "Other",
                    value: cost * 0.12
                }

            ]);

    }

}


/* =====================================================
   RECOMMENDATIONS
===================================================== */

function renderRecommendations(analysis) {

    const container =
        get("recommendations");

    if (!container) {
        return;
    }


    container.innerHTML =
        analysis.recommendations.map(item => `

            <div class="recommendation">

                <strong>
                    ${item.title}
                </strong>

                <p>
                    ${item.text}
                </p>

            </div>

        `).join("");

}


/* =====================================================
   LOCAL STORAGE
===================================================== */

function saveDraft() {

    const data =
        getFormData();


    localStorage.setItem(
        "sbpbsDraft",
        JSON.stringify(data)
    );


    showToast("Draft saved locally.");

}


function loadDraft() {

    const raw =
        localStorage.getItem("sbpbsDraft");


    if (!raw) {
        return;
    }


    try {

        const data =
            JSON.parse(raw);


        setInput("projectName", data.projectName);
        setInput("owner", data.owner);
        setInput("location", data.location);

        setInput("length", data.length);
        setInput("width", data.width);
        setInput("unit", data.unit);

        setInput("soil", data.soil);
        setInput("slope", data.slope);
        setInput("road", data.road);
        setInput("water", data.water);
        setInput("direction", data.direction);

        setInput("latitude", data.latitude);
        setInput("longitude", data.longitude);

        setInput("type", data.type);
        setInput("floors", data.floors);
        setInput("beds", data.beds);
        setInput("baths", data.baths);
        setInput("parking", data.parking);
        setInput("budget", data.budget);
        setInput("style", data.style);

        setChecked("solar", data.solar);
        setChecked("garden", data.garden);
        setChecked("terrace", data.terrace);
        setChecked("accessibility", data.accessibility);
        setChecked("smartLighting", data.smartLighting);
        setChecked("security", data.security);
        setChecked("rainwater", data.rainwater);
        setChecked("energy", data.energy);

        setInput("other", data.other);

        calculateArea();


    } catch (error) {

        console.error(
            "Could not load draft:",
            error
        );

    }

}


function setInput(id, value) {

    const element = get(id);

    if (element && value !== undefined && value !== null) {
        element.value = value;
    }

}


function setChecked(id, value) {

    const element = get(id);

    if (element) {
        element.checked = Boolean(value);
    }

}


/* =====================================================
   IMAGE UPLOAD
===================================================== */

function setupImageUpload() {

    const uploadBtn = get("uploadBtn");
    const siteImages = get("siteImages");


    if (uploadBtn && siteImages) {

        uploadBtn.addEventListener(
            "click",
            () => siteImages.click()
        );


        siteImages.addEventListener(
            "change",
            handleImages
        );

    }

}


function handleImages(event) {

    const files =
        Array.from(event.target.files || []);


    files.forEach(file => {

        if (!file.type.startsWith("image/")) {
            return;
        }


        const reader =
            new FileReader();


        reader.onload = function(e) {

            SBPBS.images.push({
                name: file.name,
                data: e.target.result
            });


            renderImagePreviews();

        };


        reader.readAsDataURL(file);

    });


    event.target.value = "";

}


function renderImagePreviews() {

    const container =
        get("imagePreviewGrid");

    if (!container) {
        return;
    }


    container.innerHTML =
        SBPBS.images.map((image, index) => `

            <div class="image-preview">

                <img
                    src="${image.data}"
                    alt="${image.name}"
                >

                <button
                    type="button"
                    class="image-remove"
                    data-index="${index}"
                >
                    ×
                </button>

            </div>

        `).join("");


    container
        .querySelectorAll(".image-remove")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    const index =
                        Number(
                            button.dataset.index
                        );

                    SBPBS.images.splice(
                        index,
                        1
                    );

                    renderImagePreviews();

                }
            );

        });

}


/* =====================================================
   GEOLOCATION
===================================================== */

function setupLocation() {

    const button =
        get("useLocationBtn");


    if (!button) {
        return;
    }


    button.addEventListener(
        "click",
        () => {

            if (!navigator.geolocation) {

                showToast(
                    "Geolocation is not supported."
                );

                return;

            }


            button.textContent =
                "Getting location...";


            navigator.geolocation.getCurrentPosition(

                position => {

                    const latitude =
                        position.coords.latitude;

                    const longitude =
                        position.coords.longitude;


                    setInput(
                        "latitude",
                        latitude.toFixed(6)
                    );


                    setInput(
                        "longitude",
                        longitude.toFixed(6)
                    );


                    button.textContent =
                        "📍 Use Current Location";


                    showToast(
                        "Location coordinates added."
                    );

                },

                () => {

                    button.textContent =
                        "📍 Use Current Location";


                    showToast(
                        "Could not access location."
                    );

                }

            );

        }
    );

}


/* =====================================================
   PROJECTS
===================================================== */

async function loadProjects() {
    try {
        SBPBS.projects = await sbpbsApi("/projects");
        renderProjects();
    } catch (error) {
        console.warn("SBPBS API unavailable; loading local demo records.", error);
        const raw = localStorage.getItem("sbpbsProjects");
        try { SBPBS.projects = raw ? JSON.parse(raw) : []; }
        catch { SBPBS.projects = []; }
        renderProjects();
    }
}

function saveProjects() {
    // Server-backed save/delete operations are performed by their calling functions.
    // Local fallback remains available for offline preview mode.
    localStorage.setItem("sbpbsProjects", JSON.stringify(SBPBS.projects));
}

async function saveCurrentProject() {
    if (!SBPBS.currentAnalysis) { showToast("Generate a plan first."); return; }
    const data = SBPBS.currentAnalysis.data;
    const project = {
        projectName: data.projectName, owner: data.owner, location: data.location,
        area: data.area, floors: data.floors, style: data.style,
        analysis: SBPBS.currentAnalysis, createdAt: new Date().toISOString()
    };
    try {
        const saved = await sbpbsApi("/projects", { method: "POST", body: JSON.stringify(project) });
        SBPBS.projects = [saved, ...SBPBS.projects.filter(p => p.id !== saved.id)];
        renderProjects();
        showToast("Project saved to MySQL successfully.");
    } catch (error) {
        console.error(error);
        const local = { ...project, id: Date.now() };
        SBPBS.projects.unshift(local); saveProjects(); renderProjects();
        showToast("Backend unavailable: saved locally only. Start Spring Boot for MySQL storage.");
    }
}

function renderProjects() {

    const container =
        get("projectsList");

    if (!container) {
        return;
    }


    const search =
        get("projectSearch")?.value
            .toLowerCase()
            .trim() || "";


    const filtered =
        SBPBS.projects.filter(
            project =>
                project.projectName
                    .toLowerCase()
                    .includes(search)
        );


    if (!filtered.length) {

        container.innerHTML = `

            <div class="dashboard-empty">

                <div class="empty-icon">
                    🏗️
                </div>

                <h3>
                    No Saved Projects
                </h3>

                <p>
                    Generate a plan and save it
                    to see your projects here.
                </p>

            </div>

        `;

        return;

    }


    container.innerHTML =
        filtered.map(project => `

            <div
                class="project-card"
                data-id="${project.id}"
            >

                <h3>
                    ${project.projectName}
                </h3>

                <p>
                    ${project.location || "Location not specified"}
                </p>


                <div class="project-meta">

                    <div>
                        <span>Area</span>

                        <strong>
                            ${formatNumber(project.area)}
                            sq.ft
                        </strong>
                    </div>


                    <div>
                        <span>Floors</span>

                        <strong>
                            ${project.floors}
                        </strong>
                    </div>


                    <div>
                        <span>Style</span>

                        <strong>
                            ${project.style}
                        </strong>
                    </div>


                    <div>
                        <span>Owner</span>

                        <strong>
                            ${project.owner || "—"}
                        </strong>
                    </div>

                </div>


                <div class="project-actions">

                    <button
                        class="outline-btn project-view"
                        data-id="${project.id}"
                    >
                        View
                    </button>


                    <button
                        class="outline-btn project-delete"
                        data-id="${project.id}"
                    >
                        Delete
                    </button>

                </div>

            </div>

        `).join("");


    container
        .querySelectorAll(".project-view")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    const id =
                        Number(
                            button.dataset.id
                        );

                    const project =
                        SBPBS.projects.find(
                            p => Number(p.id) === id
                        );


                    if (!project) {
                        return;
                    }


                    SBPBS.currentAnalysis =
                        project.analysis;


                    renderBlueprint(
                        project.analysis
                    );


                    renderDashboard(
                        project.analysis
                    );


                    scrollToSection(
                        "blueprint"
                    );

                }
            );

        });


    container
        .querySelectorAll(".project-delete")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    const id =
                        Number(
                            button.dataset.id
                        );


                    (async () => {
                        try {
                            await sbpbsApi(`/projects/${id}`, { method: "DELETE" });
                        } catch (error) {
                            console.warn("Backend delete failed; removing local copy only.", error);
                        }
                        SBPBS.projects = SBPBS.projects.filter(p => Number(p.id) !== id);
                        saveProjects();
                        renderProjects();
                        showToast("Project deleted.");
                    })();

                }
            );

        });

}


/* =====================================================
   AUTH MODAL
===================================================== */

function openAuthModal() {

    const modal =
        get("authModal");

    if (modal) {
        modal.classList.remove("hidden");
    }

}


function closeAuthModal() {

    const modal =
        get("authModal");

    if (modal) {
        modal.classList.add("hidden");
    }

}


function updateAuthUI() {

    const authButton =
        get("authButton");


    const session =
        localStorage.getItem(
            "sbpbsSession"
        );


    if (!authButton) {
        return;
    }


    if (session) {

        authButton.textContent =
            "Logout";

    } else {

        authButton.textContent =
            "Login";

    }

}


function setupAuth() {

    const authButton =
        get("authButton");

    const closeButton =
        get("closeAuthBtn");

    const backdrop =
        get("modalBackdrop");

    const form =
        get("authForm");

    const switchButton =
        get("switchAuthBtn");

    const forgotButton =
        get("forgotBtn");


    if (authButton) {

        authButton.addEventListener(
            "click",
            () => {

                const session =
                    localStorage.getItem(
                        "sbpbsSession"
                    );


                if (session) {

                    localStorage.removeItem(
                        "sbpbsSession"
                    );

                    updateAuthUI();

                    showToast(
                        "Logged out."
                    );

                } else {

                    SBPBS.authMode =
                        "login";

                    updateAuthModal();

                    openAuthModal();

                }

            }
        );

    }


    if (closeButton) {
        closeButton.addEventListener(
            "click",
            closeAuthModal
        );
    }


    if (backdrop) {
        backdrop.addEventListener(
            "click",
            closeAuthModal
        );
    }


    if (switchButton) {

        switchButton.addEventListener(
            "click",
            () => {

                SBPBS.authMode =
                    SBPBS.authMode === "login"
                        ? "register"
                        : "login";


                updateAuthModal();

            }
        );

    }


    if (forgotButton) {

        forgotButton.addEventListener(
            "click",
            () => {

                showToast(
                    "Password reset is a prototype UI feature."
                );

            }
        );

    }


    if (form) {

        form.addEventListener(
            "submit",
            event => {

                event.preventDefault();


                const email =
                    get("authEmail")?.value.trim();


                if (!email) {
                    return;
                }


                localStorage.setItem(
                    "sbpbsSession",
                    email
                );


                closeAuthModal();

                updateAuthUI();


                showToast(
                    SBPBS.authMode === "login"
                        ? "Login successful."
                        : "Account created."
                );

            }
        );

    }


    updateAuthModal();

    updateAuthUI();

}


function updateAuthModal() {

    const title =
        get("authTitle");

    const subtitle =
        get("authSubtitle");

    const submit =
        get("authSubmit");

    const switchText =
        get("authSwitch");

    const switchButton =
        get("switchAuthBtn");


    if (SBPBS.authMode === "login") {

        title.textContent =
            "Welcome Back";

        subtitle.textContent =
            "Login to access your projects.";

        submit.textContent =
            "Login";

        switchText.textContent =
            "Don't have an account?";

        switchButton.textContent =
            "Register";

    } else {

        title.textContent =
            "Create Account";

        subtitle.textContent =
            "Create your SBPBS prototype account.";

        submit.textContent =
            "Register";

        switchText.textContent =
            "Already have an account?";

        switchButton.textContent =
            "Login";

    }

}


/* =====================================================
   BLUEPRINT CONTROLS
===================================================== */

function setupBlueprintControls() {

    const zoomIn =
        get("zoomInBtn");

    const zoomOut =
        get("zoomOutBtn");

    const fullscreen =
        get("fullscreenBtn");

    const regenerate =
        get("regenerateBtn");

    const modify =
        get("modifyInputsBtn");

    const downloadSvg =
        get("downloadSvgBtn");

    const downloadJson =
        get("downloadJsonBtn");

    const print =
        get("printBtn");


    if (zoomIn) {

        zoomIn.addEventListener(
            "click",
            () => {

                SBPBS.zoom =
                    Math.min(
                        SBPBS.zoom + 0.1,
                        2
                    );

                applyBlueprintZoom();

            }
        );

    }


    if (zoomOut) {

        zoomOut.addEventListener(
            "click",
            () => {

                SBPBS.zoom =
                    Math.max(
                        SBPBS.zoom - 0.1,
                        0.5
                    );

                applyBlueprintZoom();

            }
        );

    }


    if (fullscreen) {

        fullscreen.addEventListener(
            "click",
            () => {

                const wrapper =
                    get("blueprintCanvasWrap");


                if (!document.fullscreenElement) {

                    wrapper?.requestFullscreen();

                } else {

                    document.exitFullscreen();

                }

            }
        );

    }


    if (regenerate) {

        regenerate.addEventListener(
            "click",
            runGeneration
        );

    }


    if (modify) {

        modify.addEventListener(
            "click",
            () => {

                scrollToSection("plan");

            }
        );

    }


    if (downloadSvg) {

        downloadSvg.addEventListener(
            "click",
            downloadBlueprintSVG
        );

    }


    if (downloadJson) {

        downloadJson.addEventListener(
            "click",
            downloadProjectJSON
        );

    }


    if (print) {

        print.addEventListener(
            "click",
            () => {

                window.print();

            }
        );

    }


    const emptyStart =
        get("emptyStartBtn");


    if (emptyStart) {

        emptyStart.addEventListener(
            "click",
            () => {

                scrollToSection("plan");

            }
        );

    }

}


function downloadBlueprintSVG() {

    const svg =
        get("svgBlueprint")?.innerHTML;


    if (!svg) {

        showToast(
            "Generate a blueprint first."
        );

        return;

    }


    const blob =
        new Blob(
            [svg],
            {
                type: "image/svg+xml"
            }
        );


    const url =
        URL.createObjectURL(blob);


    const link =
        document.createElement("a");


    link.href = url;

    link.download =
        "sbpbs-preliminary-blueprint.svg";


    link.click();


    URL.revokeObjectURL(url);

}


function downloadProjectJSON() {

    if (!SBPBS.currentAnalysis) {

        showToast(
            "Generate a plan first."
        );

        return;

    }


    const blob =
        new Blob(
            [
                JSON.stringify(
                    SBPBS.currentAnalysis,
                    null,
                    2
                )
            ],
            {
                type: "application/json"
            }
        );


    const url =
        URL.createObjectURL(blob);


    const link =
        document.createElement("a");


    link.href = url;

    link.download =
        "sbpbs-project-analysis.json";


    link.click();


    URL.revokeObjectURL(url);

}


/* =====================================================
   MAIN BUTTONS
===================================================== */

function setupMainButtons() {

    const start =
        get("startPlanningBtn");

    const explore =
        get("exploreBlueprintBtn");

    const newProject =
        get("newProjectBtn");


    if (start) {

        start.addEventListener(
            "click",
            () => {

                scrollToSection("plan");

            }
        );

    }


    if (explore) {

        explore.addEventListener(
            "click",
            () => {

                scrollToSection("blueprint");

            }
        );

    }


    if (newProject) {

        newProject.addEventListener(
            "click",
            () => {

                SBPBS.currentStep = 0;

                updateStepper();

                scrollToSection("plan");

            }
        );

    }

}


/* =====================================================
   FORM CONTROLS
===================================================== */

function setupFormControls() {

    const next =
        get("nextStepBtn");

    const prev =
        get("prevStepBtn");

    const generate =
        get("generateBtn");

    const save =
        get("saveDraftBtn");


    const formSteps =
        document.querySelectorAll(
            ".form-step"
        );


    if (next) {

        next.addEventListener(
            "click",
            () => {

                if (!validateStep(
                    SBPBS.currentStep
                )) {
                    return;
                }


                if (
                    SBPBS.currentStep <
                    formSteps.length - 1
                ) {

                    SBPBS.currentStep++;

                    updateStepper();

                }

            }
        );

    }


    if (prev) {

        prev.addEventListener(
            "click",
            () => {

                if (
                    SBPBS.currentStep > 0
                ) {

                    SBPBS.currentStep--;

                    updateStepper();

                }

            }
        );

    }


    if (generate) {

        generate.addEventListener(
            "click",
            runGeneration
        );

    }


    if (save) {

        save.addEventListener(
            "click",
            saveDraft
        );

    }


    ["length", "width", "unit"].forEach(id => {

        const element =
            get(id);


        if (element) {

            element.addEventListener(
                "input",
                calculateArea
            );

            element.addEventListener(
                "change",
                calculateArea
            );

        }

    });

}


/* =====================================================
   SAVE GENERATED PROJECT
===================================================== */

function setupProjectSaveShortcut() {

    const saveDraft =
        get("saveDraftBtn");


    if (!saveDraft) {
        return;
    }


    const saveProjectButton = get("saveProjectBtn");
    if (saveProjectButton) {
        saveProjectButton.addEventListener("click", saveCurrentProject);
    }

    let timer = null;

    saveDraft.addEventListener(
        "dblclick",
        () => {

            clearTimeout(timer);

            saveCurrentProject();

        }
    );

}


/* =====================================================
   SEARCH
===================================================== */

function setupProjectSearch() {

    const search =
        get("projectSearch");


    if (!search) {
        return;
    }


    search.addEventListener(
        "input",
        renderProjects
    );

}


/* =====================================================
   REVEAL ANIMATION
===================================================== */

function setupRevealAnimations() {

    const elements =
        document.querySelectorAll(
            ".reveal"
        );


    if (!("IntersectionObserver" in window)) {

        elements.forEach(
            element =>
                element.classList.add(
                    "visible"
                )
        );

        return;

    }


    const observer =
        new IntersectionObserver(
            entries => {

                entries.forEach(entry => {

                    if (entry.isIntersecting) {

                        entry.target.classList.add(
                            "visible"
                        );

                        observer.unobserve(
                            entry.target
                        );

                    }

                });

            },
            {
                threshold: 0.1
            }
        );


    elements.forEach(
        element =>
            observer.observe(element)
    );

}


/* =====================================================
   KEYBOARD
===================================================== */

function setupKeyboard() {

    document.addEventListener(
        "keydown",
        event => {

            if (
                event.key === "Escape"
            ) {

                closeAuthModal();

            }

        }
    );

}


/* =====================================================
   DEMO DATA
===================================================== */

function loadDemoData() {

    if (
        localStorage.getItem(
            "sbpbsDemoLoaded"
        )
    ) {
        return;
    }


    const hasProject =
        localStorage.getItem(
            "sbpbsDraft"
        );


    if (hasProject) {
        return;
    }


    const demo = {

        projectName:
            "Green Valley Residence",

        owner:
            "Sunil",

        location:
            "Chennai",

        length:
            60,

        width:
            40,

        unit:
            "ft",

        soil:
            "Loamy",

        slope:
            "Flat",

        road:
            "Available",

        water:
            "None",

        direction:
            "North",

        type:
            "Residential",

        floors:
            2,

        beds:
            3,

        baths:
            2,

        parking:
            "Required",

        budget:
            2500000,

        style:
            "Modern",

        solar:
            false,

        garden:
            false,

        terrace:
            false,

        accessibility:
            false,

        smartLighting:
            false,

        security:
            false,

        rainwater:
            false,

        energy:
            false,

        other:
            ""

    };


    setInput(
        "projectName",
        demo.projectName
    );

    setInput(
        "owner",
        demo.owner
    );

    setInput(
        "location",
        demo.location
    );

    setInput(
        "length",
        demo.length
    );

    setInput(
        "width",
        demo.width
    );

    setInput(
        "unit",
        demo.unit
    );

    setInput(
        "soil",
        demo.soil
    );

    setInput(
        "slope",
        demo.slope
    );

    setInput(
        "road",
        demo.road
    );

    setInput(
        "water",
        demo.water
    );

    setInput(
        "direction",
        demo.direction
    );

    setInput(
        "type",
        demo.type
    );

    setInput(
        "floors",
        demo.floors
    );

    setInput(
        "beds",
        demo.beds
    );

    setInput(
        "baths",
        demo.baths
    );

    setInput(
        "parking",
        demo.parking
    );

    setInput(
        "budget",
        demo.budget
    );

    setInput(
        "style",
        demo.style
    );


    calculateArea();

}



/* =====================================================
   THEME SWITCHER
===================================================== */
function setupThemeToggle() {
    const toggle = document.getElementById("themeToggle");
    if (!toggle) return;

    const icon = toggle.querySelector(".theme-toggle-icon");
    const label = toggle.querySelector(".theme-toggle-label");

    function applyTheme(theme) {
        const light = theme === "light";
        document.body.classList.toggle("theme-light", light);
        if (icon) icon.textContent = light ? "☾" : "☀";
        if (label) label.textContent = light ? "Dark" : "Light";
        toggle.setAttribute("aria-label", light ? "Switch to dark theme" : "Switch to light theme");
        toggle.setAttribute("title", light ? "Switch to dark theme" : "Switch to light theme");
    }

    let savedTheme = "dark";
    try { savedTheme = localStorage.getItem("sbpbs-theme") || "dark"; } catch (error) { /* storage may be unavailable */ }
    applyTheme(savedTheme);

    toggle.addEventListener("click", () => {
        const nextTheme = document.body.classList.contains("theme-light") ? "dark" : "light";
        applyTheme(nextTheme);
        try { localStorage.setItem("sbpbs-theme", nextTheme); } catch (error) { /* theme still works for this session */ }
    });
}

/* =====================================================
   INITIALIZATION
===================================================== */

function initializeSBPBS() {

    setupThemeToggle();
    setupNavigation();

    setupFormControls();

    setupImageUpload();

    setupLocation();

    setupAuth();

    setupBlueprintControls();

    setupMainButtons();

    setupProjectSearch();

    setupRevealAnimations();

    setupKeyboard();

    setupProjectSaveShortcut();

    loadProjects();

    loadDraft();

    loadDemoData();

    calculateArea();

    updateStepper();

}


/* =====================================================
   START APP
===================================================== */

document.addEventListener(
    "DOMContentLoaded",
    initializeSBPBS
);