package com.sbpbs;
import com.fasterxml.jackson.databind.JsonNode;
import java.time.Instant;
public record ProjectResponse(Long id, String projectName, String owner, String location, Double area, Integer floors, String style, Instant createdAt, JsonNode analysis) {}
