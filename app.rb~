require 'rubygems'
require 'sinatra/base'
require 'sass'
require 'barista'

class Shoebox < Sinatra::Base
	set :root, File.dirname(__FILE__) #otherwise Sinatra gets confused finding static assets
	register Barista::Integration::Sinatra
	Barista.configure do
		Barista.root = Barista.output_root = File.dirname(__FILE__)+'/public/js/'
	end

	before { request.env['PATH_INFO'].gsub!(/\/$/, '') }

	get '/' do
		erb :index
	end

	get '/data' do
		@callback = params[:jsoncallback]
		erb :data, :layout=>false
	end

	get '/css/style.css' do
		scss :style, :views=>File.dirname(__FILE__)+'/public/css/'
	end
	get '/js/code.js' do
		coffee :code
	end
end
