package com.example.guide;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.is;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class ShoppingGuideBackendApplicationTests {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void listsProducts() throws Exception {
        mockMvc.perform(get("/api/products"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$", hasSize(4)))
            .andExpect(jsonPath("$[0].name", is("简约通勤白衬衫")));
    }

    @Test
    void returnsSkuInventory() throws Exception {
        mockMvc.perform(get("/api/inventory/sku/1001"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.skuId", is(1001)))
            .andExpect(jsonPath("$.stock", is(36)));
    }

    @Test
    void addsAvailableSkuToCart() throws Exception {
        mockMvc.perform(post("/api/cart/items")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"skuId\":1001,\"quantity\":2}"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.itemCount", is(2)))
            .andExpect(jsonPath("$.totalAmount", is(398)));
    }

    @Test
    void rejectsUnavailableSku() throws Exception {
        mockMvc.perform(post("/api/cart/items")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"skuId\":1006,\"quantity\":1}"))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.message", is("SKU 库存不足")));
    }

    @Test
    void previewsOrderFromCart() throws Exception {
        mockMvc.perform(post("/api/cart/items")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"skuId\":1003,\"quantity\":1}"))
            .andExpect(status().isOk());

        mockMvc.perform(post("/api/orders/preview"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.itemCount", is(1)))
            .andExpect(jsonPath("$.payableAmount", is(429)));
    }
}
