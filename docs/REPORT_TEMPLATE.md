# Smart Building Planning and Blueprint Suggestion System (SBPBS)

## Abstract
SBPBS is an academic web prototype that collects plot, site, building and preference inputs and presents preliminary rule-based recommendations, cost estimates and a 2D SVG floor-plan visualization. The frontend uses HTML, CSS and JavaScript. The backend uses Java Spring Boot REST APIs and MySQL persistence for saved project records.

## Problem Statement
Preliminary building planning involves reviewing multiple site and building parameters. Users may find it difficult to organize these inputs and compare initial space and budget options in one place.

## Objectives
1. Collect project, site and building requirements through a structured interface.
2. Calculate preliminary plot/buildable area and estimated cost using transparent assumptions.
3. Display rule-based recommendations and a visual 2D preliminary layout.
4. Save and retrieve project records through a Java REST API backed by MySQL.

## Existing System
Initial planning may rely on separate manual calculations, notes and sketches, making information harder to organize and compare.

## Proposed System
SBPBS combines data entry, preliminary analysis, recommendations, visualization, dashboard display and project persistence in one application.

## Modules
- Project and site input
- Building requirement and preference input
- Rule-based site/building analysis
- Preliminary cost estimation
- SVG blueprint visualization
- Dashboard and recommendation display
- Project persistence (Spring Boot + MySQL)

## Architecture
Browser (HTML/CSS/JavaScript) communicates with Spring Boot REST endpoints over HTTP/JSON. Spring Data JPA stores project metadata and analysis JSON in MySQL. The existing JavaScript renders the detailed SVG plan and dashboard. See the component and deployment UML diagrams.

## Algorithms / Assumptions
- Plot area = plot length × plot width, converted to square feet when the unit is metres.
- Assumed preliminary buildable footprint = 75% of plot area; this is a prototype assumption, not a legal setback rule.
- Total built area estimate = assumed footprint × number of floors.
- Preliminary cost estimate = total built area × style-based rate configured in the prototype.
- Recommendations are rule-based and depend on selected site conditions and preferences.

## UML Diagrams
Include the seven PlantUML diagrams in `diagrams/`: use case, class, activity, sequence, component, deployment and state.

## Testing Plan
1. Start MySQL and confirm `sbpbs_db` exists.
2. Start Spring Boot and verify `GET /api/health` returns `UP`.
3. Send sample input to `POST /api/analyze` and inspect the returned estimates and recommendations.
4. Create a project using `POST /api/projects`; verify it appears in `GET /api/projects` and in the MySQL `projects` table.
5. Test the website form with valid and invalid values.
6. Generate a blueprint and check that the dashboard and recommendations render.
7. Delete a saved project and verify it is removed from the API and database.

## Results
Fill this section only after running the application on the submission computer. Record observed test results, screenshots and any known limitations.

## Limitations and Future Scope
The current prototype is not a permit-ready architectural drawing or structural engineering system. Authentication is only a frontend UI prototype. Future work may add secure authentication, role-based access, stronger input validation, automated tests, richer room-layout constraints and professional review workflows.

## Conclusion
SBPBS demonstrates a single workflow for gathering preliminary planning inputs, generating estimates and recommendations, visualizing a concept layout and saving project records. All generated suggestions require verification by qualified professionals before construction.
