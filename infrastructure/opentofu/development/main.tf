terraform {
  required_providers {
    infisical = {
      source  = "infisical/infisical"
      version = "0.14.1"
    }

    azurerm = {
      source  = "hashicorp/azurerm"
      version = "4.20.0"
    }

    mongodbatlas = {
      source  = "mongodb/mongodbatlas"
      version = "1.27.0"
    }
  }

  encryption {
    key_provider "pbkdf2" "passphrase" {
      passphrase = var.encryption_passphrase
    }

    method "aes_gcm" "passphrase_gcm" {
      keys = key_provider.pbkdf2.passphrase
    }

    state {
      method   = method.aes_gcm.passphrase_gcm
      enforced = true
    }

    plan {
      method   = method.aes_gcm.passphrase_gcm
      enforced = true
    }
  }

  backend "azurerm" {
    storage_account_name = "flipsendevst0"
    container_name       = "tfstate"
    key                  = "dev.terraform.tfstate"
  }
}

provider "infisical" {
  auth = {
    universal = {
      client_id     = var.infisical_client_id
      client_secret = var.infisical_client_secret
    }
  }
}

data "infisical_secrets" "env" {
  folder_path  = "/terraform"
  env_slug     = var.environment
  workspace_id = var.infisical_workspace_id
}

locals {
  project_name = nonsensitive(data.infisical_secrets.env.secrets["PROJECT_NAME"].value)

  azure_resource_location = nonsensitive(data.infisical_secrets.env.secrets["AZURE_RESOURCE_LOCATION"].value)
  azure_webapp_location   = nonsensitive(data.infisical_secrets.env.secrets["AZURE_WEBAPP_LOCATION"].value)

  azure_subscription_id             = nonsensitive(data.infisical_secrets.env.secrets["AZURE_SUBSCRIPTION_ID"].value)
  azure_client_id                   = nonsensitive(data.infisical_secrets.env.secrets["AZURE_CLIENT_ID"].value)
  azure_client_certificate_password = data.infisical_secrets.env.secrets["AZURE_CERTIFICATE_PASSWORD"].value
  azure_client_certificate          = data.infisical_secrets.env.secrets["AZURE_CERTIFICATE"].value
  azure_tenant_id                   = nonsensitive(data.infisical_secrets.env.secrets["AZURE_TENANT_ID"].value)

  mongo_org_id      = nonsensitive(data.infisical_secrets.env.secrets["MONGO_ORG_ID"].value)
  mongo_public_key  = data.infisical_secrets.env.secrets["MONGO_PUBLIC_KEY"].value
  mongo_private_key = data.infisical_secrets.env.secrets["MONGO_PRIVATE_KEY"].value

  mongo_cluster_location  = nonsensitive(data.infisical_secrets.env.secrets["MONGO_CLUSTER_LOCATION"].value)
  mongo_cluster_provider  = nonsensitive(data.infisical_secrets.env.secrets["MONGO_CLUSTER_PROVIDER"].value)
  mongo_project_whitelist = nonsensitive(data.infisical_secrets.env.secrets["MONGO_PROJECT_WHITELIST"].value)
}

provider "azurerm" {
  subscription_id             = local.azure_subscription_id
  client_id                   = local.azure_client_id
  client_certificate_password = local.azure_client_certificate_password
  client_certificate          = local.azure_client_certificate
  tenant_id                   = local.azure_tenant_id
  features {}
}

provider "mongodbatlas" {
  public_key  = local.mongo_public_key
  private_key = local.mongo_private_key
}
