package com.sbpbs;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.Map;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;

class AnalysisControllerTest {
    private MockMvc mvc;

    @BeforeEach
    void setUp() {
        mvc = MockMvcBuilders.standaloneSetup(new AnalysisController()).build();
    }

    @Test
    void analyzesValidPlotAndReturnsEstimate() throws Exception {
        mvc.perform(post("/api/analyze")
                .contentType("application/json")
                .content("{\"length\":40,\"width\":30,\"unit\":\"ft\",\"floors\":2,\"style\":\"Modern\"}"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.plotAreaSqFt").value(1200.0))
            .andExpect(jsonPath("$.assumedBuildableAreaSqFt").value(900.0))
            .andExpect(jsonPath("$.totalBuiltAreaSqFt").value(1800.0))
            .andExpect(jsonPath("$.estimatedCostINR").value(3960000.0))
            .andExpect(jsonPath("$.recommendations").isArray());
    }

    @Test
    void rejectsZeroDimensions() throws Exception {
        mvc.perform(post("/api/analyze")
                .contentType("application/json")
                .content("{\"length\":0,\"width\":30,\"unit\":\"ft\"}"))
            .andExpect(status().isBadRequest());
    }

    @Test
    void returnsRequestedRoomNamesAndDimensionsForWeightedBlueprint() throws Exception {
        mvc.perform(post("/api/blueprint")
                .contentType("application/json")
                .content("{\"length\":40,\"width\":30,\"unit\":\"ft\",\"beds\":3,\"baths\":2,\"parking\":\"Required\"}"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.rooms.length()").value(8))
            .andExpect(jsonPath("$.rooms[0].name").value("Living"))
            .andExpect(jsonPath("$.rooms[2].name").value("Bedroom 1"))
            .andExpect(jsonPath("$.rooms[7].name").value("Parking"))
            .andExpect(jsonPath("$.layoutType").value("weighted-partition-concept"))
            .andExpect(jsonPath("$.rooms[0].widthFt").isNumber())
            .andExpect(jsonPath("$.rooms[0].heightFt").isNumber())
            .andExpect(jsonPath("$.rooms[0].areaSqFt").isNumber())
            .andExpect(jsonPath("$.warnings").isArray());
    }
}
