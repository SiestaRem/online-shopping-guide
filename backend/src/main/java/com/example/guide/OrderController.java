package com.example.guide;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/orders")
@CrossOrigin(origins = {"http://localhost:5173", "http://127.0.0.1:5173"})
class OrderController {

    private final CartService cartService;

    OrderController(CartService cartService) {
        this.cartService = cartService;
    }

    @PostMapping("/preview")
    OrderPreviewResponse preview() {
        return cartService.previewOrder();
    }
}
