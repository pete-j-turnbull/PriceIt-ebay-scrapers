# -*- mode: ruby -*-
# vi: set ft=ruby :

Vagrant.configure(2) do |config|

  config.vm.box = "data-science-toolbox/dst"

  config.vm.network :forwarded_port, guest: 8885, host:8885
  

  config.vm.synced_folder "/Users/pete/.ssh", "/home/vagrant/.ssh"
  config.vm.synced_folder "/Users/pete/triptease/vagrant/ebay-scrapers", "/home/vagrant/ebay-scrapers"

  

  config.vm.provider "virtualbox" do |vb|
    vb.memory = "2048"
  end

  
  config.vm.provision "shell", inline: <<-SHELL
    sudo apt-get update
    yes | sudo apt-get install vim

  SHELL
end
