export const buildStatefulComponent = (renderFn: string, className: string, propsType: string): string =>
  `// Put this next to your other type declarations
interface StateProps {
  // Declare which fields you intend to store in component state
}

class ${ className } extends React.Component<${ propsType }, StateProps> {
  constructor(props: ${ propsType }) {
    super(props);

    this.state = {
      // Your state goes here
    };
  }

  render() {
  ${ renderFn }
  }
}`;