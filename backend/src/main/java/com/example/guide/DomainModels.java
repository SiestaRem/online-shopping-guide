package com.example.guide;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.util.List;

record ProductResponse(
    Long id,
    Long skuId,
    String category,
    String coverText,
    String name,
    BigDecimal price,
    Integer stock,
    String summary,
    List<String> tags
) {
}

record InventoryResponse(Long skuId, Integer stock, boolean available) {
}

record AddCartItemRequest(
    @NotNull Long skuId,
    @Min(1) Integer quantity
) {
}

record CartItemResponse(Long skuId, String name, BigDecimal price, Integer quantity, BigDecimal amount) {
}

record CartSummaryResponse(Integer itemCount, BigDecimal totalAmount, List<CartItemResponse> items) {
}

record OrderPreviewResponse(Integer itemCount, BigDecimal payableAmount, List<CartItemResponse> items) {
}

record ErrorResponse(String message) {
}

record CatalogProduct(
    Long id,
    Long skuId,
    String category,
    String coverText,
    String name,
    BigDecimal price,
    Integer stock,
    String summary,
    List<String> tags
) {
    ProductResponse toResponse() {
        return new ProductResponse(id, skuId, category, coverText, name, price, stock, summary, tags);
    }
}
