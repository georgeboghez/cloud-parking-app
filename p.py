import json
from pprint import pprint

with open("package-lock.json") as f:
    packagejson = json.loads(f.read())

for dependency in packagejson["dependencies"]:
    print('"{dependency}" : "{version}",'.format(dependency=dependency, version=packagejson["dependencies"][dependency]["version"]))
    # print('"' + dependency + '"' + ":" + )