package com.example.guide;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/inventory")
@CrossOrigin(origins = {"http://localhost:5173", "http://127.0.0.1:5173"})
class InventoryController {

    private final CatalogService catalogService;

    InventoryController(CatalogService catalogService) {
        this.catalogService = catalogService;
    }

    @GetMapping("/sku/{skuId}")
    InventoryResponse getInventory(@PathVariable Long skuId) {
        return catalogService.getInventory(skuId);
    }
}
