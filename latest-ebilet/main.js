const config = require('./config');
const { fetchAndFilterJourneys } = require('./src/functions');

class Queue {
    constructor() {
        this.tasks = [];
        this.running = false;
    }

    addTask(task) {
        this.tasks.push(task);
        if (!this.running) {
            this.run();
        }
    }

    async run() {
        this.running = true;
        while (this.tasks.length > 0) {
            const task = this.tasks[0];
            try {
                console.log(`### Started checking for ${task.from} to ${task.to} on ${task.date} at ${task.time}.`);
                await fetchAndFilterJourneys(task.from, task.to, task.date, task.time);
                console.log(`### Completed checking for ${task.from} to ${task.to} on ${task.date} at ${task.time}. \n### Will restart in ${config.sleepTime} seconds.`);
            } catch (error) {
                console.error(`### An error occurred while checking for ${task.from} to ${task.to} on ${task.date} at ${task.time}: `, error);
            } finally {
                this.tasks.shift(); 
            }
        }
        this.running = false;
    }
}

function main() {
    const queue = new Queue();

    setInterval(() => {
        // round-trip
        queue.addTask({ from: "", to: "", date: "", time: "" });
        queue.addTask({ from: "", to: "", date: "", time: "" });

        // round-trip
        queue.addTask({ from: "", to: "", date: "", time: "" });
        queue.addTask({ from: "", to: "", date: "", time: "" });
    }, config.sleepTime * 1000);
}

main();