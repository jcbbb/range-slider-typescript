import React, { useRef, useState, useCallback } from 'react';

type Props = {
    max: number;
    min: number;
    defaultMin: number;
    defaultMax: number;
};

const RangeSlider = ({ max, min, defaultMin, defaultMax }: Props) => {
    const track = useRef<HTMLDivElement>(null!);
    const background = useRef<HTMLDivElement>(null!);
    const thumbLeft = useRef<HTMLSpanElement>(null!);
    const thumbRight = useRef<HTMLSpanElement>(null!);
    const dragElement = useRef<HTMLElement>(null!);

    const getClientX = (event: MouseEvent | TouchEvent): number => {
        if ('touches' in event) {
            return event.touches[0].clientX;
        }
        return event.clientX;
    };

    const getPercentageValue = (value: number): number => {
        return Math.round((value * 100) / max);
    };

    const getLabelValue = (handle: number): number => {
        return Math.round((handle * max) / 100);
    };

    const [handles, setHandles] = useState({
        min: getPercentageValue(defaultMin),
        max: getPercentageValue(defaultMax),
    });

    const getEdges = useCallback(() => {
        const { left, width } = background.current.getBoundingClientRect() as DOMRect;
        let leftEdge = 0;
        let rightEdge = width;
        if (dragElement.current === thumbLeft.current) {
            rightEdge = thumbRight.current.getBoundingClientRect().left - left - thumbRight.current.offsetWidth;
            return [leftEdge, rightEdge];
        } else if (dragElement.current === thumbRight.current) {
            leftEdge = thumbLeft.current.getBoundingClientRect().right - left + thumbLeft.current.offsetWidth;
            return [leftEdge, rightEdge];
        }

        rightEdge = width - track.current.offsetWidth;
        return [leftEdge, rightEdge];
    }, []);

    const handleDrag = useCallback(
        (event: React.MouseEvent | React.TouchEvent) => {
            event.preventDefault();
            const target = event.target as HTMLElement;
            dragElement.current = target;

            const { left, right } = target.getBoundingClientRect() as DOMRect;
            const shiftX = getClientX(event.nativeEvent) - (target === thumbRight.current ? right : left);

            (['mousemove', 'touchmove'] as const).forEach((eventName) => {
                document.addEventListener(eventName, mousemove);
            });

            ['mouseup', 'touchend'].forEach((eventName) => {
                document.addEventListener(eventName, mouseup);
            });

            function mousemove(event: MouseEvent | TouchEvent) {
                const { left } = background.current.getBoundingClientRect() as DOMRect;
                let newLeft = getClientX(event) - shiftX - left;

                const [leftEdge, rightEdge] = getEdges();

                // Handle the edges
                if (newLeft < leftEdge) {
                    newLeft = leftEdge;
                }
                if (newLeft > rightEdge) {
                    newLeft = rightEdge;
                }

                // Update percentages based on handles
                if (dragElement.current === thumbLeft.current) {
                    setHandles((prev) => ({
                        ...prev,
                        min: Math.round((newLeft / background.current.offsetWidth) * 100),
                    }));
                }

                if (dragElement.current === thumbRight.current) {
                    setHandles((prev) => ({
                        ...prev,
                        max: Math.round((newLeft / background.current.offsetWidth) * 100),
                    }));
                }

                if (dragElement.current === track.current) {
                    setHandles({
                        min: Math.round((newLeft / background.current.offsetWidth) * 100),
                        max: Math.round(((newLeft + track.current.offsetWidth) / background.current.offsetWidth) * 100),
                    });
                }
            }

            function mouseup() {
                (['mousemove', 'touchmove'] as const).forEach((eventName) => {
                    document.removeEventListener(eventName, mousemove);
                });
                ['mouseup', 'touchend'].forEach((eventName) => {
                    document.removeEventListener(eventName, mouseup);
                });
            }
        },
        [setHandles, getEdges],
    );

    return (
        <div className="range">
            <span className="range__label range__label--min">{min}</span>
            <div className="range__track-background" ref={background}>
                <div
                    className="range__track"
                    ref={track}
                    draggable="false"
                    style={{ width: `${handles.max - handles.min}%`, left: `${handles.min}%` }}
                    onMouseDown={handleDrag}
                    onTouchStart={handleDrag}
                ></div>
                <span
                    className="range__thumb"
                    ref={thumbLeft}
                    draggable="false"
                    style={{ left: `${handles.min}%` }}
                    onMouseDown={handleDrag}
                    onTouchStart={handleDrag}
                >
                    <span className="range__thumb-label">{getLabelValue(handles.min)}</span>
                </span>
                <span
                    className="range__thumb range__thumb--max"
                    ref={thumbRight}
                    draggable="false"
                    style={{ left: `${handles.max}%` }}
                    onMouseDown={handleDrag}
                    onTouchStart={handleDrag}
                >
                    <span className="range__thumb-label">{getLabelValue(handles.max)}</span>
                </span>
            </div>
            <span className="range__label range__label--max">{max}</span>
        </div>
    );
};

export default RangeSlider;
