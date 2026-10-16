output "load_balancer_dns_name" {
  description = "Public DNS name of the application load balancer."
  value       = aws_lb.application.dns_name
}

output "ecr_repository_url" {
  description = "Repository that accepts immutable application images."
  value       = aws_ecr_repository.application.repository_url
}

output "database_endpoint" {
  description = "Private PostgreSQL endpoint."
  value       = aws_db_instance.application.address
}
