resource "azurerm_resource_group" "rg" {
  name     = "${local.project_name}-${var.environment}-rg"
  location = local.azure_resource_location
}
