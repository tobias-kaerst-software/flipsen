resource "azurerm_service_plan" "asp" {
  resource_group_name = azurerm_resource_group.rg.name
  location            = azurerm_resource_group.rg.location

  name     = "app-service-plan"
  os_type  = "Linux"
  sku_name = "B3"
}

resource "azurerm_linux_web_app" "name" {
  count = 10

  resource_group_name = azurerm_resource_group.rg.name
  location            = azurerm_resource_group.rg.location
  service_plan_id     = azurerm_service_plan.asp.id

  name       = "linux-app-${count.index}"
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

output "web_app_urls" {
  value       = [for app in azurerm_linux_web_app.name : "https://${app.default_hostname}"]
  description = "List of URLs for the deployed web apps"
}
