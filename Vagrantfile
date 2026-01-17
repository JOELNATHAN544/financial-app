Vagrant.configure("2") do |config|
  config.vm.box = "ubuntu/jammy64"

  # Provisioning a lightweight database VM
  config.vm.hostname = "db-test-vm"
  config.vm.network "forwarded_port", guest: 5432, host: 5433

  config.vm.provider "virtualbox" do |vb|
    vb.memory = "1024"
    vb.cpus = 1
    # Note: Modern boxes often come with 40GB+ pre-allocated. 
    # To strictly limit to 5GB would require a custom box or a specific plugin.
    # We set a custom name for easier management.
    vb.name = "financial-app-db-vm"
  end

  # Install PostgreSQL 15
  config.vm.provision "shell", inline: <<-SHELL
    sudo apt-get update
    sudo apt-get install -y wget gnupg2
    
    # Add PostgreSQL APT repository
    wget --quiet -O - https://www.postgresql.org/media/keys/ACCC4CF8.asc | sudo apt-key add -
    echo "deb http://apt.postgresql.org/pub/repos/apt/ jammy-pgdg main" | sudo tee /etc/apt/sources.list.d/pgdg.list
    
    sudo apt-get update
    sudo apt-get install -y postgresql-15
    
    # Configure PostgreSQL to accept connections
    sudo sed -i "s/#listen_addresses = 'localhost'/listen_addresses = '*'/g" /etc/postgresql/15/main/postgresql.conf
    echo "host all all 0.0.0.0/0 md5" | sudo tee -a /etc/postgresql/15/main/pg_hba.conf
    
    # Create database and user
    sudo -u postgres psql -c "CREATE DATABASE financial_tracker;"
    sudo -u postgres psql -c "CREATE USER nathan WITH PASSWORD 'nathan';"
    sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE financial_tracker TO nathan;"
    
    sudo systemctl restart postgresql
  SHELL
end
