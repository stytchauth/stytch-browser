import React, { useState } from 'react';

export const Button = ({ name, onClick, glowing }) => (
  <button name={name} className={glowing ? 'glower' : ''} onClick={onClick}>
    <code>{name}</code>
  </button>
);

export const Section = ({ children, title }) => {
  const key = `workbench_section::${title}`;
  const [isOpen, setIsOpen] = useState(() => localStorage.getItem(key) === 'true');
  const onClick = (e) => {
    e.preventDefault();
    setIsOpen((isOpen) => {
      localStorage.setItem(key, !isOpen);
      return !isOpen;
    });
  };
  return (
    <details open={isOpen}>
      <summary onClick={onClick}>{title}</summary>
      {children}
    </details>
  );
};

//
// This is nearly identical to the WorkbenchForm component in react-b2b-demo, except it supports binding refs to inputs
// TODO: Create shared package for demo app react components
//
// Schema looks like
// [
//   { name: 'name', kind: 'string' },
//   { name: 'user_id', kind: 'string', ref: userIDRef },
//   { name: 'create_member_as_pending', kind: 'boolean' },
//   { name: 'favorite_color', kind: 'select', values ['red', 'green', 'grey'] }
// ]
export const WorkbenchForm = ({ schema, methodName, onSubmit }) => {
  const children = [];

  for (let attr of schema) {
    const { name, kind, values, ref } = attr;

    const labelText = name
      .split('_')
      .map((tok) => tok.substr(0, 1).toLocaleUpperCase() + tok.substr(1))
      .join(' ');

    children.push(
      <label key={`label-${name}`} htmlFor={name}>
        {labelText}:{' '}
      </label>,
    );

    if (kind === 'string') {
      children.push(<input key={`input-${name}`} type="text" id={name} name={name} ref={ref} />);
    } else if (kind === 'boolean') {
      children.push(<input key={`input-${name}`} type="checkbox" id={name} name={name} ref={ref} />);
    } else if (kind === 'number') {
      children.push(<input key={`input-${name}`} type="number" id={name} name={name} ref={ref} />);
    } else if (kind === 'json') {
      children.push(<textarea key={`input-${name}`} id={name} name={name} ref={ref} />);
    } else if (kind === 'select') {
      children.push(
        <select key={`input-${name}`} name={name} id={name} ref={ref}>
          <option value="">Unset</option>
          {values.map((v) => (
            <option key={v} value={v}>
              {v}
            </option>
          ))}
        </select>,
      );
    } else {
      throw Error('I do not know how to render this thing you gave me');
    }
    children.push(<br key={`br-${name}`} />);
  }

  const formDataToJSON = (formData) => {
    const coerceEmptyStr = (input) => (input && input !== '' ? input : undefined);
    const res = {};
    for (let [k, v] of Array.from(formData.entries())) {
      res[k] = coerceEmptyStr(v);
    }
    return res;
  };

  const parseArrayStr = (str) => {
    if (str === '' || str === undefined) {
      return undefined;
    }
    return str.split(',').map((item) => item.trim());
  };

  const doSubmit = (e) => {
    e.preventDefault();
    const data = new FormData(e.target);
    const req = formDataToJSON(data);

    for (let attr of schema.filter((attr) => !!req[attr.name])) {
      // Convert all checkboxes from 'on'/'off' to true/false
      if (attr.kind === 'boolean') {
        req[attr.name] = req[attr.name] === 'on';
      }

      // convert '1234' to 1234
      if (attr.kind === 'number') {
        req[attr.name] = parseInt(req[attr.name]);
      }

      // Convert all JSON to actual objects
      if (attr.kind === 'json') {
        req[attr.name] = JSON.parse(req[attr.name]);
      }

      // Convert 'foo,bar' to ['foo', 'bar']
      if (attr.is_csv) {
        req[attr.name] = parseArrayStr(req[attr.name]);
      }
    }

    onSubmit(req);
  };

  return (
    <div className="workbenchForm">
      <form onSubmit={doSubmit}>
        <div>{children}</div>
        <Button name={methodName} type="submit" />
      </form>
    </div>
  );
};
