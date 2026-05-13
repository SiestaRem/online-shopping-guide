package com.example.guide;

import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Service
class CartService {

    private final CatalogService catalogService;
    private final List<CartItemResponse> items = new ArrayList<>();

    CartService(CatalogService catalogService) {
        this.catalogService = catalogService;
    }

    CartSummaryResponse addItem(AddCartItemRequest request) {
        CatalogProduct product = catalogService.getBySkuId(request.skuId());
        if (product.stock() < request.quantity()) {
            throw new BusinessException("SKU 库存不足");
        }

        items.clear();
        items.add(toCartItem(product, request.quantity()));
        return summary();
    }

    CartSummaryResponse summary() {
        int itemCount = items.stream().mapToInt(CartItemResponse::quantity).sum();
        BigDecimal totalAmount = items.stream()
            .map(CartItemResponse::amount)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
        return new CartSummaryResponse(itemCount, totalAmount, List.copyOf(items));
    }

    OrderPreviewResponse previewOrder() {
        CartSummaryResponse cart = summary();
        return new OrderPreviewResponse(cart.itemCount(), cart.totalAmount(), cart.items());
    }

    private CartItemResponse toCartItem(CatalogProduct product, Integer quantity) {
        BigDecimal amount = product.price().multiply(BigDecimal.valueOf(quantity));
        return new CartItemResponse(product.skuId(), product.name(), product.price(), quantity, amount);
    }
}
