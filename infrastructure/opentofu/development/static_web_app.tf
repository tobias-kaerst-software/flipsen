resource "azurerm_static_web_app" "web" {
  resource_group_name = azurerm_resource_group.rg.name
  name                = "${var.environment}-static-web-app"

  location = "westeurope"
  sku_tier = "Free"
  sku_size = "Free"
}
