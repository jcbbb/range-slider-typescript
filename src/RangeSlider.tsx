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

    const handleThumbLeft = useCallback(
        (event: React.MouseEvent | React.TouchEvent) => {
            event.preventDefault();
            const { left } = thumbLeft.current.getBoundingClientRect() as DOMRect;
            const shiftX = getClientX(event.nativeEvent) - left;

            (['mousemove', 'touchmove'] as const).forEach((eventName) => {
                document.addEventListener(eventName, mousemove);
            });

            ['mouseup', 'touchend'].forEach((eventName) => {
                document.addEventListener(eventName, mouseup);
            });

            function mousemove(event: MouseEvent | TouchEvent) {
                const { left } = background.current.getBoundingClientRect() as DOMRect;
                let newLeft = getClientX(event) - shiftX - left;

                if (newLeft < 0) {
                    newLeft = 0;
                }

                const rightEdge =
                    thumbRight.current.getBoundingClientRect().left -
                    background.current.getBoundingClientRect().left -
                    thumbRight.current.offsetWidth;

                if (newLeft > rightEdge) {
                    newLeft = rightEdge;
                }

                setHandles((prev) => ({
                    ...prev,
                    min: Math.round((newLeft / background.current.offsetWidth) * 100),
                }));
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
        [setHandles],
    );

    const handleThumbRight = useCallback(
        (event: React.MouseEvent | React.TouchEvent) => {
            event.preventDefault();
            const { right } = thumbRight.current.getBoundingClientRect() as DOMRect;
            const shiftX = getClientX(event.nativeEvent) - right;

            (['mousemove', 'touchmove'] as const).forEach((eventName) => {
                document.addEventListener(eventName, mousemove);
            });

            ['mouseup', 'touchend'].forEach((eventName) => {
                document.addEventListener(eventName, mouseup);
            });

            function mousemove(event: MouseEvent | TouchEvent) {
                const { left } = background.current.getBoundingClientRect() as DOMRect;
                let newLeft = getClientX(event) - shiftX - left;

                const leftEdge =
                    thumbLeft.current.getBoundingClientRect().right -
                    background.current.getBoundingClientRect().left +
                    thumbLeft.current.offsetWidth;

                if (newLeft < leftEdge) {
                    newLeft = leftEdge;
                }

                const rightEdge = background.current.offsetWidth;

                if (newLeft > rightEdge) {
                    newLeft = rightEdge;
                }

                setHandles((prev) => ({
                    ...prev,
                    max: Math.round((newLeft / background.current.offsetWidth) * 100),
                }));
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
        [setHandles],
    );

    const handleTrack = useCallback(
        (event: React.MouseEvent | React.TouchEvent) => {
            event.preventDefault();

            const { left } = track.current.getBoundingClientRect() as DOMRect;
            const shiftX = getClientX(event.nativeEvent) - left;

            (['mousemove', 'touchmove'] as const).forEach((eventName) => {
                document.addEventListener(eventName, mousemove);
            });

            ['mouseup', 'touchend'].forEach((eventName) => {
                document.addEventListener(eventName, mouseup);
            });

            function mousemove(event: MouseEvent | TouchEvent) {
                const { left } = background.current.getBoundingClientRect() as DOMRect;
                const rightEdge = background.current.offsetWidth - track.current.offsetWidth;

                let newLeft = getClientX(event) - shiftX - left;

                if (newLeft < 0) {
                    newLeft = 0;
                }
                if (newLeft > rightEdge) {
                    newLeft = rightEdge;
                }

                setHandles({
                    min: Math.round((newLeft / background.current.offsetWidth) * 100),
                    max: Math.round(((newLeft + track.current.offsetWidth) / background.current.offsetWidth) * 100),
                });
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
        [setHandles],
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
                    onMouseDown={handleTrack}
                    onTouchStart={handleTrack}
                ></div>
                <span
                    className="range__thumb"
                    ref={thumbLeft}
                    draggable="false"
                    style={{ left: `${handles.min}%` }}
                    onMouseDown={handleThumbLeft}
                    onTouchStart={handleThumbLeft}
                >
                    <span className="range__thumb-label">{getLabelValue(handles.min)}</span>
                </span>
                <span
                    className="range__thumb range__thumb--max"
                    ref={thumbRight}
                    draggable="false"
                    style={{ left: `${handles.max}%` }}
                    onMouseDown={handleThumbRight}
                    onTouchStart={handleThumbRight}
                >
                    <span className="range__thumb-label">{getLabelValue(handles.max)}</span>
                </span>
            </div>
            <span className="range__label range__label--max">{max}</span>
        </div>
    );
};

export default RangeSlider;
