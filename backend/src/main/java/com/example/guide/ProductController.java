package com.example.guide;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/products")
@CrossOrigin(origins = {"http://localhost:5173", "http://127.0.0.1:5173"})
class ProductController {

    private final CatalogService catalogService;

    ProductController(CatalogService catalogService) {
        this.catalogService = catalogService;
    }

    @GetMapping
    List<ProductResponse> listProducts() {
        return catalogService.listProducts();
    }

    @GetMapping("/{skuId}")
    ProductResponse getProduct(@PathVariable Long skuId) {
        return catalogService.getBySkuId(skuId).toResponse();
    }
}
