resource "azurerm_static_web_app" "web" {
  resource_group_name = azurerm_resource_group.rg.name
  location            = local.azure_webapp_location

  name = "${var.environment}-static-web-app"

  sku_tier = "Free"
  sku_size = "Free"
}
