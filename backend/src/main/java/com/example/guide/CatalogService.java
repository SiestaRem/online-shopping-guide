package com.example.guide;

import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

@Service
class CatalogService {

    private final List<CatalogProduct> products = List.of(
        new CatalogProduct(1L, 1001L, "通勤穿搭", "职场白衬衫", "简约通勤白衬衫", BigDecimal.valueOf(199), 36,
            "适合面试、通勤和日常搭配，版型利落，当前库存充足。", List.of("预算内", "面试", "简约", "库存充足")),
        new CatalogProduct(2L, 1002L, "搭配单品", "轻商务托特包", "轻商务托特包", BigDecimal.valueOf(269), 18,
            "容量适合电脑和资料，风格与面试场景匹配。", List.of("预算内", "面试", "百搭")),
        new CatalogProduct(3L, 1003L, "运动爆款", "缓震跑鞋", "缓震透气跑步鞋", BigDecimal.valueOf(429), 42,
            "适合日常跑步训练，缓震中底降低膝盖压力，鞋面透气。", List.of("预算内", "运动", "轻便", "库存充足")),
        new CatalogProduct(4L, 1004L, "运动搭配", "速干短袖", "速干训练短袖", BigDecimal.valueOf(129), 57,
            "适合搭配跑步鞋组成基础运动套装，轻薄速干。", List.of("预算内", "运动", "速干", "库存充足")),
        new CatalogProduct(6L, 1006L, "库存过滤样例", "断码皮鞋", "断码商务皮鞋", BigDecimal.valueOf(259), 0,
            "当前无库存，应被推荐过滤。", List.of("面试", "商务"))
    );

    List<ProductResponse> listProducts() {
        return products.stream()
            .filter(product -> product.stock() > 0)
            .map(CatalogProduct::toResponse)
            .toList();
    }

    CatalogProduct getBySkuId(Long skuId) {
        return products.stream()
            .filter(product -> product.skuId().equals(skuId))
            .findFirst()
            .orElseThrow(() -> new BusinessException("SKU 不存在"));
    }

    InventoryResponse getInventory(Long skuId) {
        CatalogProduct product = getBySkuId(skuId);
        return new InventoryResponse(product.skuId(), product.stock(), product.stock() > 0);
    }
}
