variable "locations" {
  default = [
    "Germany West Central",
    "Switzerland North",
    "Poland Central",
    "France Central",
    "Sweden Central",
    "Italy North",
    "West Europe",
    "North Europe",
    "UK West",
    "UK South",
  ]
}

resource "azurerm_service_plan" "asp" {
  for_each = toset(var.locations)

  resource_group_name = azurerm_resource_group.rg.name
  location            = each.key

  name     = "app-service-plan-${replace(lower(each.key), " ", "-")}"
  os_type  = "Linux"
  sku_name = "B1"
}

resource "azurerm_linux_web_app" "webapp" {
  for_each = azurerm_service_plan.asp

  resource_group_name = azurerm_resource_group.rg.name
  location            = each.value.location
  service_plan_id     = each.value.id

  name       = "${local.project_name}-linux-app-${replace(lower(each.key), " ", "-")}"
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
  value       = [for app in azurerm_linux_web_app.webapp : "https://${app.default_hostname}"]
  description = "List of URLs for the deployed web apps"
}

output "web_app_outbound_ips" {
  value       = { for app in azurerm_linux_web_app.webapp : app.name => app.outbound_ip_addresses }
  description = "List of outbound IP addresses for the deployed web apps"
}
