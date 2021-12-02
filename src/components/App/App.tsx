import React from 'react';
import { Container } from 'react-bootstrap';

import { ChildList } from '../ChildList';

import 'bootstrap/dist/css/bootstrap.min.css';

export const App: React.FC = () => {
  return (
    <Container>
      <div className="py-5 text-center">
        <h2>Famly - Hire Me Example</h2>
      </div>
      <ChildList />
    </Container>
  );
};
