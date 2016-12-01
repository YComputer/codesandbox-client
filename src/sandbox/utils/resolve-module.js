// @flow
import type { Module } from '../../app/store/entities/modules/';

import { getModuleChildren } from '../../app/store/entities/modules/selector';

const getInitialModuleId = (module, hasChildren) => {
  if (hasChildren) {
    if (module.parentModuleId == null) return module.id;
    return module.parentModuleId;
  }
  return module.id;
};

/**
 * Convert the module path to a module
 */
export default (module: Module, path: string, modules: Array<Module>) => {
  // Split path
  const splitPath = path.replace(/^.\//, '').split('/');

  const children = getModuleChildren(module, modules);

  // Initial module is the initial module to start searching fron
  const initialModuleId = getInitialModuleId(module, children.length > 0);
  const initialModule = modules.find(m => m.id === initialModuleId);

  if (!initialModule) throw new Error(`Cannot find module in path ${path}`);
  const resolvedModule = splitPath.reduce((prev, moduleName) => {
    if (moduleName === '') return prev;

    const isParent = moduleName === '..';
    let foundModule = null;
    // Go up if the found module is a parent
    if (isParent) {
      foundModule = modules.find(x => x.id === prev.parentModuleId);
    } else {
      foundModule = children.find(m => m != null && m.title === moduleName);
    }

    if (!foundModule) throw Error(`Cannot find module in path ${path}`);

    return foundModule;
  }, initialModule);

  if (resolvedModule === module) throw new Error(`${module.title} is importing itself`);
  return resolvedModule;
};