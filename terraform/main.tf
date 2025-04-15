provider "aws" {
  region = "ap-south-1"
}

resource "aws_key_pair" "quickevent_key" {
  key_name   = "quickevent-key"
  public_key = file("${path.module}/quickevent-key.pub")
}

resource "aws_security_group" "quickevent_sg" {
  name        = "quickevent_sg"
  description = "Allow SSH and app access"

  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"] # SSH access
  }

  ingress {
    from_port   = 3000
    to_port     = 3000
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"] # App access
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_instance" "quickevent_server" {
  ami                         = "ami-0f5ee92e2d63afc18" # Amazon Linux 2 for ap-south-1
  instance_type               = "t2.micro"
  key_name                    = aws_key_pair.quickevent_key.key_name
  vpc_security_group_ids      = [aws_security_group.quickevent_sg.id]

  tags = {
    Name = "quickevent-server"
  }

  user_data = <<-EOF
              #!/bin/bash
              yum update -y
              curl -sL https://rpm.nodesource.com/setup_16.x | bash -
              yum install -y nodejs git
              EOF
}

output "public_ip" {
  value = aws_instance.quickevent_server.public_ip
}
