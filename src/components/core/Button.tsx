import classnames from 'classnames';
import Link from 'next/link';

const Button = ({ link = null, children, className = '', variant = 'primary', size = 'md', ...rest }) => {
  const ButtonElement = (
    <button
      className={classnames(
        'items-center justify-center rounded-xl font-header text-primary-light font-bold',
        {
          'bg-primary hover:bg-primary-blue-light disabled:bg-primary-blue-dark': variant === 'primary',
          'border border-white border-1 hover:bg-secondary-lightGrey disabled:bg-secondary-lightGrey disabled:opacity-20':
            variant === 'secondary',
          ' disabled:text-primary-light disabled:opacity-20': variant === 'tertiary',
          'h-[72px] min-w-[150px] text-3xl px-5': size === 'lg',
          'h-[56px] min-w-[100px] text-2xl px-4': size === 'md',
          'h-[40px] min-w-[70px] text-base px-3': size === 'sm',
          'h-[32px] whitespace-nowrap py-1 text-base': size === 'xs',
          'whitespace-nowrap text-base': size === 'auto',
          'cursor-not-allowed opacity-50 hover:text-inherit': rest?.disabled,
        },
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  );

  return link && !rest.disabled ? <Link {...link}>{ButtonElement}</Link> : ButtonElement;
};

export default Button;
