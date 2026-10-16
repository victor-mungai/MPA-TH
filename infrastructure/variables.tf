variable "aws_region" {
  description = "AWS region used by the reference architecture."
  type        = string
  default     = "af-south-1"
}

variable "name" {
  description = "Prefix used for resource names."
  type        = string
  default     = "mpa-api"

  validation {
    condition     = can(regex("^[a-z][a-z0-9-]{2,30}$", var.name))
    error_message = "name must be 3-31 lowercase letters, numbers, or hyphens."
  }
}

variable "vpc_cidr" {
  description = "Address space for the workload VPC."
  type        = string
  default     = "10.40.0.0/16"
}

variable "container_image" {
  description = "Immutable ECR image URI, including a digest."
  type        = string
  default     = "000000000000.dkr.ecr.af-south-1.amazonaws.com/mpa-api@sha256:0000000000000000000000000000000000000000000000000000000000000000"

  validation {
    condition     = can(regex("@sha256:[0-9a-f]{64}$", var.container_image))
    error_message = "container_image must be pinned to a sha256 digest."
  }
}

variable "database_url_secret_arn" {
  description = "ARN of an existing Secrets Manager secret containing DATABASE_URL."
  type        = string
  default     = "arn:aws:secretsmanager:af-south-1:000000000000:secret:mpa-api/database-url-placeholder"
  sensitive   = true
}

variable "certificate_arn" {
  description = "ARN of the ACM certificate used by the HTTPS listener."
  type        = string
  default     = "arn:aws:acm:af-south-1:000000000000:certificate/00000000-0000-0000-0000-000000000000"
}

variable "desired_count" {
  description = "Normal number of running application tasks."
  type        = number
  default     = 2
}

variable "min_capacity" {
  description = "Minimum ECS task count."
  type        = number
  default     = 2
}

variable "max_capacity" {
  description = "Maximum ECS task count."
  type        = number
  default     = 10

  validation {
    condition     = var.max_capacity >= var.min_capacity
    error_message = "max_capacity must be greater than or equal to min_capacity."
  }
}
