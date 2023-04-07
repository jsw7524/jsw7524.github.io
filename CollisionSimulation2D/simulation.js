class Ball {
    constructor(x, y, radius, color, dx, dy) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.dx = dx;
        this.dy = dy;
    }

    draw(context) {
        context.beginPath();
        context.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        context.fillStyle = this.color;
        context.fill();
        context.closePath();
    }

    update() {
        this.x += this.dx;
        this.y += this.dy;
    }
}

function getRandomColor() {
    const colors = ['#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF'];
    return colors[Math.floor(Math.random() * colors.length)];
}

function createRandomBall(canvasWidth, canvasHeight) {
    const radius = Math.random() * 20 + 10;
    const x = Math.random() * (canvasWidth - 2 * radius) + radius;
    const y = Math.random() * (canvasHeight - 2 * radius) + radius;
    const color = getRandomColor();
    const dx = Math.random() * 4 - 2;
    const dy = Math.random() * 4 - 2;

    return new Ball(x, y, radius, color, dx, dy);
}

function checkCollision(ball1, ball2) {
    const dx = ball1.x - ball2.x;
    const dy = ball1.y - ball2.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    return distance <= ball1.radius + ball2.radius;
}

function resolveCollision(ball1, ball2) {
    const dx = ball1.x - ball2.x;
    const dy = ball1.y - ball2.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    const unitVectorX = dx / distance;
    const unitVectorY = dy / distance;

    const relativeVelocityX = ball1.dx - ball2.dx;
    const relativeVelocityY = ball1.dy - ball2.dy;

    const impulse = (relativeVelocityX * unitVectorX) + (relativeVelocityY * unitVectorY);

    ball1.dx -= impulse * unitVectorX;
    ball1.dy -= impulse * unitVectorY;
    ball2.dx += impulse * unitVectorX;
    ball2.dy += impulse * unitVectorY;
}

const canvas = document.getElementById('simulation');
const context = canvas.getContext('2d');

const numberOfBalls = 25;
const balls = [];

function init() {
    for (let i = 0; i < numberOfBalls; i++) {
        balls.push(createRandomBall(canvas.width, canvas.height));
    }
}


function update() {
    for (let i = 0; i < balls.length; i++) {
        const ball = balls[i];

        // Update ball position
        ball.update();

        // Check for collisions with canvas edges
        if (ball.x + ball.radius >= canvas.width || ball.x - ball.radius <= 0) {
            ball.dx = -ball.dx;
        }
        if (ball.y + ball.radius >= canvas.height || ball.y - ball.radius <= 0) {
            ball.dy = -ball.dy;
        }

        // Check for collisions with other balls
        for (let j = i + 1; j < balls.length; j++) {
            if (checkCollision(ball, balls[j])) {
                resolveCollision(ball, balls[j]);
            }
        }

        // Check for collisions with the mouse cursor
        if (checkMouseCollision(ball)) {
            const dx = ball.x - mouse.x;
            const dy = ball.y - mouse.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            const unitVectorX = dx / distance;
            const unitVectorY = dy / distance;

            const bounceIntensity = 5;
            ball.dx = unitVectorX * bounceIntensity;
            ball.dy = unitVectorY * bounceIntensity;
        }
    }
}

function draw() {
    context.clearRect(0, 0, canvas.width, canvas.height);

    for (const ball of balls) {
        ball.draw(context);
    }
}

function loop() {
    update();
    draw();
    requestAnimationFrame(loop);
}

const mouse = {
    x: 0,
    y: 0
};

canvas.addEventListener('mousemove', event => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = event.clientX - rect.left;
    mouse.y = event.clientY - rect.top;
});

function checkMouseCollision(ball) {
    const dx = ball.x - mouse.x;
    const dy = ball.y - mouse.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    return distance <= ball.radius;
}

// Start the simulation loop
/*loop();*/