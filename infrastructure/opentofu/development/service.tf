resource "azurerm_service_plan" "asp" {
  resource_group_name = azurerm_resource_group.rg.name
  location            = azurerm_resource_group.rg.location

  name     = "${var.environment}-app-service-plan"
  os_type  = "Linux"
  sku_name = "B1"
}

resource "azurerm_linux_web_app" "name" {
  resource_group_name = azurerm_resource_group.rg.name
  location            = azurerm_resource_group.rg.location
  service_plan_id     = azurerm_service_plan.asp.id

  name       = "${var.environment}-linux-app"
  https_only = true

  site_config {
    http2_enabled = true

    application_stack {
      docker_image_name        = "ghcr.io/tobias-kaerst-software/flipsen:latest"
      docker_registry_url      = "https://ghcr.io"
      docker_registry_username = local.docker_registry_username
      docker_registry_password = local.docker_registry_password
    }
  }
}
