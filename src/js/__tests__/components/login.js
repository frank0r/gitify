import React from 'react'; // eslint-disable-line no-unused-vars
import { shallow } from 'enzyme';

import { LoginPage } from '../../components/login';

const { shell, ipcRenderer, remote } = require('electron');
const BrowserWindow = remote.BrowserWindow;

function setup(props) {
  const options = {
    context: {
      router: {
        push: jest.fn(),
        replace: jest.fn()
      }
    }
  };

  const wrapper = shallow(<LoginPage {...props} />, options);

  return {
    context: options.context,
    props: props,
    wrapper: wrapper,
  };
};

describe('components/login.js', function () {
  beforeEach(function() {
    BrowserWindow().loadURL.mockReset();
    ipcRenderer.send.mockReset();
    shell.openExternal.mockReset();
  });

  it('should render itself & its children', function () {
    const props = {
      isLoggedIn: false,
      token: null,
      response: {},
      failed: false,
      isFetching: false
    };

    const { wrapper } = setup(props);

    expect(wrapper).toBeDefined();
    expect(wrapper.find('.desc').text()).toContain('in your menu bar.');
  });

  it('should open the login window and get a code successfully (will-navigate)', function () {
    const code = '123123123';

    spyOn(BrowserWindow().webContents, 'on').and.callFake((event, callback) => {
      if (event === 'will-navigate') {
        callback('will-navigate', `http://www.github.com/?code=${code}`);
      }
    });

    const expectedUrl = 'https://github.com/login/oauth/' +
      'authorize?client_id=3fef4433a29c6ad8f22c&scope=user:email,notifications';

    const props = {
      loginUser: jest.fn(),
      token: null,
      response: {},
      failed: false,
      isFetching: false
    };

    const { wrapper } = setup(props);

    expect(wrapper).toBeDefined();

    wrapper.find('.btn').simulate('click');

    expect(BrowserWindow().loadURL).toHaveBeenCalledTimes(1);
    expect(BrowserWindow().loadURL).toHaveBeenCalledWith(expectedUrl);
    expect(props.loginUser).toHaveBeenCalledTimes(1);
    expect(props.loginUser).toHaveBeenCalledWith(code);
  });

  it('should open the login window and get a code successfully (did-get-redirect-request)', function () {
    const code = '123123123';

    spyOn(BrowserWindow().webContents, 'on').and.callFake((event, callback) => {
      if (event === 'did-get-redirect-request') {
        callback('did-get-redirect-request', null, `http://www.github.com/?code=${code}`);
      }
    });

    const expectedUrl = 'https://github.com/login/oauth/' +
      'authorize?client_id=3fef4433a29c6ad8f22c&scope=user:email,notifications';

    const props = {
      loginUser: jest.fn(),
      token: null,
      response: {},
      failed: false,
      isFetching: false
    };

    const { wrapper } = setup(props);

    expect(wrapper).toBeDefined();

    wrapper.find('.btn').simulate('click');

    expect(BrowserWindow().loadURL).toHaveBeenCalledTimes(1);
    expect(BrowserWindow().loadURL).toHaveBeenCalledWith(expectedUrl);
    expect(props.loginUser).toHaveBeenCalledTimes(1);
    expect(props.loginUser).toHaveBeenCalledWith(code);
  });

  it('should open the login window and get an error', function () {
    const error = 'Oops! Something went wrong.';

    spyOn(BrowserWindow().webContents, 'on').and.callFake((event, callback) => {
      if (event === 'did-get-redirect-request') {
        callback('did-get-redirect-request', null, `http://www.github.com/?error=${error}`);
      }
    });

    const expectedUrl = 'https://github.com/login/oauth/' +
      'authorize?client_id=3fef4433a29c6ad8f22c&scope=user:email,notifications';

    const props = {
      loginUser: jest.fn(),
      token: null,
      response: {},
      failed: false,
      isFetching: false
    };

    const { wrapper } = setup(props);

    expect(wrapper).toBeDefined();

    wrapper.find('.btn').simulate('click');

    expect(BrowserWindow().loadURL).toHaveBeenCalledTimes(1);
    expect(BrowserWindow().loadURL).toHaveBeenCalledWith(expectedUrl);
    expect(props.loginUser).not.toHaveBeenCalled();

    expect(alert).toHaveBeenCalledTimes(1);
    expect(alert).toHaveBeenCalledWith(
      'Oops! Something went wrong and we couldn\'t log you in using Github. Please try again.'
    );
  });

  it('should close the browser window before logging in', function () {
    spyOn(BrowserWindow(), 'on').and.callFake((event, callback) => {
      if (event === 'close') {
        callback();
      }
    });

    const props = {
      loginUser: jest.fn(),
      token: null,
      response: {},
      failed: false,
      isFetching: false
    };

    const { wrapper } = setup(props);

    expect(wrapper).toBeDefined();

    wrapper.find('.btn').simulate('click');

    expect(BrowserWindow().loadURL).toHaveBeenCalledTimes(1);
    expect(props.loginUser).not.toHaveBeenCalled();
  });

  it('should redirect to notifications once logged in', function () {
    const props = {
      token: null,
      response: {},
      failed: false,
      isFetching: false
    };

    const { wrapper, context } = setup(props);

    expect(wrapper).toBeDefined();

    wrapper.setProps({
      token: 'HELLO'
    });
    expect(ipcRenderer.send).toHaveBeenCalledTimes(1);
    expect(ipcRenderer.send).toHaveBeenCalledWith('reopen-window');
    expect(context.router.push).toHaveBeenCalledTimes(1);
    expect(context.router.push).toHaveBeenCalledWith('/notifications');
  });

  it('should request the github token if the oauth code is received', function () {
    const code = 'thisisacode';

    const props = {
      loginUser: jest.fn(),
      token: null,
      response: {},
      failed: false,
      isFetching: false
    };

    const { wrapper } = setup(props);

    expect(wrapper).toBeDefined();

    wrapper.instance().requestGithubToken(code);
    expect(props.loginUser).toHaveBeenCalledTimes(1);
    expect(props.loginUser).toHaveBeenCalledWith(code);
  });
});
