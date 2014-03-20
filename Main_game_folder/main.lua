function love.load()
   white = love.graphics.newImage("whitefusionv2avatar.png")
   x = 50
   y = 50
end
function love.draw()
    love.graphics.print("Hello World", 400, 300)
	love.graphics.print("Husky Likes butts!", 400, 350)
	love.graphics.print("I can't believe it's not butts!", 400, 375)
	love.graphics.circle( "fill", 300, 300, 50, 100 )
	love.graphics.draw(white, x, y)
end