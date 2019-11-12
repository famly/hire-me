import React, { Component } from 'react';

class TimePicker extends Component {
    constructor(props) {
        super(props);

        this.selectHour = this.selectHour.bind(this);
        this.selectMinute = this.selectMinute.bind(this);
    }

    state = {
        hour: null,
        minute: null,

    }

    getTimeString(hours, minutes) {
        let hour = hours > 12 ? hours - 12 : hours;
        let minute = typeof minutes !== 'undefined' ? ':' + minutes : '';
        const postfix = hours > 11 ? 'pm' : 'am';
        return hour + minute + postfix;
    }

    selectHour(hour) {
        this.setState({ hour });
        this.setState({ minute: null }, () => this.props.getTime(this.state.hour, this.state.minute));
    }

    selectMinute(minute) {
        this.setState({ minute }, () => this.props.getTime(this.state.hour, this.state.minute));
    }

    render() {
        const hours = [8, 9, 10, 11, 12, 13, 14, 15, 16];
        const minutes = [0, 15, 30, 45];

        return (
            <div>
                <ul className="hours">
                    {hours.map(hour => {
                        return (<li key={hour} onClick={() => this.selectHour(hour)} className={hour === this.state.hour ? 'selected' : null}>
                            {this.getTimeString(hour)}
                        </li>)
                    })}
                </ul>
                {this.state.hour ? (<ul className="minutes">
                    {minutes.map(minute => {
                        return (<li key={minute} onClick={() => this.selectMinute(minute)} className={minute === this.state.minute ? 'selected' : null}>
                            {this.getTimeString(this.state.hour, minute)}
                        </li>)
                    })}
                </ul>) : ''}
            </div>
        );
    }
}


export default TimePicker;