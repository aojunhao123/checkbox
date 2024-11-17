import classNames from 'classnames';
import useMergedState from 'rc-util/lib/hooks/useMergedState';
import omit from 'rc-util/lib/omit';
import pickAttrs from 'rc-util/lib/pickAttrs';
import * as React from 'react';
import { forwardRef, useImperativeHandle, useRef } from 'react';

export interface CheckboxChangeEvent {
  target: CheckboxChangeEventTarget;
  stopPropagation: () => void;
  preventDefault: () => void;
  nativeEvent: React.ChangeEvent<HTMLInputElement>['nativeEvent'];
}

export interface CheckboxChangeEventTarget extends CheckboxProps {
  checked: boolean;
}

export interface CheckboxRef {
  focus: (options?: FocusOptions) => void;
  blur: () => void;
  input: HTMLInputElement | null;
  nativeElement: HTMLElement | null;
}

export interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  prefixCls?: string;
  onChange?: (e: CheckboxChangeEvent) => void;
}

const DEFAULT_ARIA_LABEL = 'checkbox';

export const Checkbox = forwardRef<CheckboxRef, CheckboxProps>((props, ref) => {
  const {
    prefixCls = 'rc-checkbox',
    className,
    style,
    checked,
    disabled,
    defaultChecked = false,
    type = 'checkbox',
    title,
    onChange,
    ...inputProps
  } = props;

  const a11yProps = {
    ...pickAttrs(inputProps, true),
    'aria-label': inputProps['aria-label'] || DEFAULT_ARIA_LABEL,
  } as React.AriaAttributes;

  const restProps = omit<React.HTMLAttributes<HTMLDivElement>, keyof React.AriaAttributes>(
    inputProps,
    Object.keys(a11yProps) as Array<keyof React.AriaAttributes>,
  );

  const inputRef = useRef<HTMLInputElement>(null);
  const holderRef = useRef<HTMLElement>(null);

  const [rawValue, setRawValue] = useMergedState(defaultChecked, {
    value: checked,
  });

  useImperativeHandle(ref, () => ({
    focus: (options) => {
      inputRef.current?.focus(options);
    },
    blur: () => {
      inputRef.current?.blur();
    },
    input: inputRef.current,
    nativeElement: holderRef.current,
  }));

  const classString = classNames(prefixCls, className, {
    [`${prefixCls}-checked`]: rawValue,
    [`${prefixCls}-disabled`]: disabled,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) {
      return;
    }

    if (!('checked' in props)) {
      setRawValue(e.target.checked);
    }

    onChange?.({
      target: {
        ...props,
        type,
        checked: e.target.checked,
      },
      stopPropagation() {
        e.stopPropagation();
      },
      preventDefault() {
        e.preventDefault();
      },
      nativeEvent: e.nativeEvent,
    });
  };

  return (
    <span className={classString} title={title} style={style} ref={holderRef}>
      <input
        {...restProps}
        {...a11yProps}
        className={`${prefixCls}-input`}
        ref={inputRef}
        onChange={handleChange}
        disabled={disabled}
        checked={!!rawValue}
        type={type}
      />
      <span className={`${prefixCls}-inner`} />
    </span>
  );
});

export default Checkbox;
