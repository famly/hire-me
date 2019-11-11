const hoursInRange = (max, min) => {
    const today = new Date();
    const hours = [];

    for(let i = min; i <= max; i++) {
        const date = new Date(today.getFullYear(), today.getMonth(), today.getDate(), i);
        hours.push(date);
    }

    return hours;
}

const minutesIntervalInHour = (time, interval) => {
    const today = new Date();
    const hour = new Date(time).getHours();
    const intervals = 60 / interval;
    const hours = [];
    
    for(let i = 0; i < intervals; i++) {
        const minutes = i * interval;
        const date = new Date(today.getFullYear(), today.getMonth(), today.getDate(), hour, minutes);
        hours.push(date);
    }

    return hours;
}

const convertToHours = time => time.toLocaleString('en-US', { hour: 'numeric', hour12: true });

const convertToHoursAndMinutes = time => time.toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true });

export { hoursInRange, minutesIntervalInHour, convertToHours, convertToHoursAndMinutes };